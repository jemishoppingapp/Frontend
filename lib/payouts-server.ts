/**
 * Payout operations. Two methods:
 *   - manual: admin already sent money elsewhere, we just record it
 *   - paystack: we call the Transfer API to actually send the money
 *
 * Either way we write a `payout` row in the payouts table AND a `payout`
 * entry in escrow_ledger, which is what lowers the seller's available
 * balance (available = sum(release) - sum(payout)).
 */
import { and, eq, sql } from 'drizzle-orm';
import { db, schema } from '@/db';
import { dbPool } from '@/db/pool';
import { getSellerEscrowSummary } from '@/lib/escrow-server';

const TRANSFER_RECIPIENT_API = 'https://api.paystack.co/transferrecipient';
const TRANSFER_API = 'https://api.paystack.co/transfer';

export interface PayoutResult {
  ok: boolean;
  payoutId?: string;
  error?: string;
}

/**
 * Create a payout for a seller's FULL available balance.
 *
 * method='manual': records transferRef the admin provides; status completed.
 * method='paystack': initiates a Paystack transfer; status processing,
 *   completed via webhook later (transfer.success).
 */
export async function createPayout(
  sellerId: string,
  method: 'manual' | 'paystack',
  opts: { transferRef?: string; note?: string; createdBy?: string } = {},
): Promise<PayoutResult> {
  // Compute available balance fresh
  const summary = await getSellerEscrowSummary(sellerId);
  const amount = summary.availableBalance;

  if (amount <= 0) {
    return { ok: false, error: 'Seller has no available balance to pay out.' };
  }

  // Load seller bank details for the snapshot + transfer
  const sellerRows = await db().select().from(schema.sellers).where(eq(schema.sellers.id, sellerId)).limit(1);
  const seller = sellerRows[0];
  if (!seller) return { ok: false, error: 'Seller not found.' };

  const bankSnapshot = {
    bankName: seller.bankName,
    bankCode: seller.bankCode,
    accountNumber: seller.bankAccountNumber,
    accountName: seller.bankAccountName,
  };

  if (method === 'manual') {
    return await recordManualPayout(sellerId, amount, bankSnapshot, opts);
  }
  return await createPaystackPayout(sellerId, amount, bankSnapshot, seller, opts);
}

async function recordManualPayout(
  sellerId: string,
  amount: number,
  bankSnapshot: Record<string, string>,
  opts: { transferRef?: string; note?: string; createdBy?: string },
): Promise<PayoutResult> {
  return await dbPool().transaction(async (tx) => {
    const inserted = await tx.execute(sql`
      INSERT INTO payouts (seller_id, amount, method, status, transfer_ref, bank_snapshot, note, created_by, completed_at)
      VALUES (${sellerId}, ${String(amount)}, 'manual', 'completed',
              ${opts.transferRef ?? ''}, ${JSON.stringify(bankSnapshot)}::jsonb,
              ${opts.note ?? ''}, ${opts.createdBy ?? null}, now())
      RETURNING id
    `);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payoutId = (inserted.rows[0] as any).id;

    // Ledger entry — this lowers available balance
    await tx.execute(sql`
      INSERT INTO escrow_ledger (type, order_id, seller_id, amount, note, external_ref, created_by)
      VALUES ('payout', NULL, ${sellerId}, ${String(amount)},
              ${opts.note ?? 'Manual payout'}, ${opts.transferRef ?? ''}, ${opts.createdBy ?? null})
    `);

    return { ok: true, payoutId };
  });
}

async function createPaystackPayout(
  sellerId: string,
  amount: number,
  bankSnapshot: Record<string, string>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  seller: any,
  opts: { note?: string; createdBy?: string },
): Promise<PayoutResult> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return { ok: false, error: 'PAYSTACK_SECRET_KEY not set' };
  if (process.env.PAYSTACK_TRANSFERS_ENABLED !== 'true') {
    return { ok: false, error: 'Paystack transfers are not enabled. Set PAYSTACK_TRANSFERS_ENABLED=true once your account supports transfers.' };
  }

  try {
    // 1. Ensure a transfer recipient exists. Reuse stored code if present.
    let recipientCode = seller.paystackSubaccountCode || '';
    // We store the recipient code in paystackSubaccountCode if it starts with RCP_
    if (!recipientCode.startsWith('RCP_')) {
      const recRes = await fetch(TRANSFER_RECIPIENT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
        body: JSON.stringify({
          type: 'nuban',
          name: seller.bankAccountName,
          account_number: seller.bankAccountNumber,
          bank_code: seller.bankCode,
          currency: 'NGN',
        }),
      });
      if (!recRes.ok) {
        const body = await recRes.json().catch(() => null);
        return { ok: false, error: body?.message ?? `Recipient creation failed (${recRes.status})` };
      }
      const recData = await recRes.json();
      recipientCode = recData?.data?.recipient_code ?? '';
      if (!recipientCode) return { ok: false, error: 'Paystack did not return a recipient code.' };

      // Save it for reuse
      await db().update(schema.sellers)
        .set({ paystackSubaccountCode: recipientCode, updatedAt: new Date() })
        .where(eq(schema.sellers.id, sellerId));
    }

    // 2. Create the payout row first (status processing) so we have an id
    const inserted = await db().execute(sql`
      INSERT INTO payouts (seller_id, amount, method, status, bank_snapshot, note, created_by)
      VALUES (${sellerId}, ${String(amount)}, 'paystack', 'processing',
              ${JSON.stringify(bankSnapshot)}::jsonb, ${opts.note ?? ''}, ${opts.createdBy ?? null})
      RETURNING id
    `);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payoutId = (inserted.rows[0] as any).id;

    // 3. Initiate the transfer (amount in kobo)
    const transferRes = await fetch(TRANSFER_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      body: JSON.stringify({
        source: 'balance',
        amount: Math.round(amount * 100),
        recipient: recipientCode,
        reason: opts.note || 'JEMI seller payout',
        reference: `payout_${payoutId}`,
      }),
    });

    if (!transferRes.ok) {
      const body = await transferRes.json().catch(() => null);
      // Mark the payout failed
      await db().execute(sql`UPDATE payouts SET status = 'failed', note = ${body?.message ?? 'transfer failed'} WHERE id = ${payoutId}`);
      return { ok: false, error: body?.message ?? `Transfer failed (${transferRes.status})` };
    }

    const transferData = await transferRes.json();
    const transferCode = transferData?.data?.transfer_code ?? '';
    const transferStatus = transferData?.data?.status ?? 'pending';

    // 4. Write the ledger entry (money is committed now)
    await db().execute(sql`
      INSERT INTO escrow_ledger (type, order_id, seller_id, amount, note, external_ref, created_by)
      VALUES ('payout', NULL, ${sellerId}, ${String(amount)},
              ${opts.note ?? 'Paystack payout'}, ${transferCode}, ${opts.createdBy ?? null})
    `);

    // 5. Update payout row with transfer code. If Paystack says success
    // immediately, mark completed; otherwise leave processing.
    const finalStatus = transferStatus === 'success' ? 'completed' : 'processing';
    await db().execute(sql`
      UPDATE payouts
      SET transfer_ref = ${transferCode},
          status = ${finalStatus},
          completed_at = ${finalStatus === 'completed' ? new Date() : null}
      WHERE id = ${payoutId}
    `);

    return { ok: true, payoutId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Transfer request failed' };
  }
}

/**
 * Sellers due for payout, grouped by cadence. A seller is "due" if their
 * available balance > 0.
 */
export async function getPayoutQueue(): Promise<{
  weekly: PayoutQueueEntry[];
  monthly: PayoutQueueEntry[];
}> {
  // Get all approved sellers with their cadence + bank
  const sellerRows = await db()
    .select({
      id: schema.sellers.id,
      businessName: schema.sellers.businessName,
      bankName: schema.sellers.bankName,
      bankAccountNumber: schema.sellers.bankAccountNumber,
      bankAccountName: schema.sellers.bankAccountName,
      cadence: schema.sellers.payoutCadence,
    })
    .from(schema.sellers)
    .where(eq(schema.sellers.status, 'approved'));

  const weekly: PayoutQueueEntry[] = [];
  const monthly: PayoutQueueEntry[] = [];

  for (const s of sellerRows) {
    const summary = await getSellerEscrowSummary(s.id);
    if (summary.availableBalance <= 0) continue;
    const entry: PayoutQueueEntry = {
      sellerId: s.id,
      businessName: s.businessName,
      bankName: s.bankName,
      accountNumber: s.bankAccountNumber,
      accountName: s.bankAccountName,
      availableBalance: summary.availableBalance,
      pendingBalance: summary.pendingBalance,
    };
    if (s.cadence === 'monthly') monthly.push(entry);
    else weekly.push(entry);
  }

  weekly.sort((a, b) => b.availableBalance - a.availableBalance);
  monthly.sort((a, b) => b.availableBalance - a.availableBalance);

  return { weekly, monthly };
}

export interface PayoutQueueEntry {
  sellerId: string;
  businessName: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  availableBalance: number;
  pendingBalance: number;
}