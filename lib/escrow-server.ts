/**
 * Server-only escrow operations. These touch the DB and Paystack.
 * Imported by:
 *   - /api/paystack/verify (createHoldEntriesForOrder)
 *   - /api/orders/[orderNumber]/confirm-receipt (releaseEscrowForOrder)
 *   - /api/cron/escrow-jobs (autoReleaseStale, autoCancelAbandoned, flagMixed)
 *   - /api/admin/orders/[orderNumber]/refund (initiateRefund)
 *   - /api/seller/escrow-summary (getSellerEscrowSummary)
 */
import { and, eq, sql } from 'drizzle-orm';
import { db, schema } from '@/db';
import { dbPool } from '@/db/pool';
import { computeSellerBreakdown } from '@/lib/escrow';

const REFUND_API = 'https://api.paystack.co/refund';

/**
 * After payment is verified, create one `hold` ledger entry per seller
 * in the order. Idempotent — checks for existing hold entries first.
 */
export async function createHoldEntriesForOrder(orderId: string): Promise<void> {
  const existing = await db()
    .select({ id: schema.escrowLedger.id })
    .from(schema.escrowLedger)
    .where(and(
      eq(schema.escrowLedger.orderId, orderId),
      eq(schema.escrowLedger.type, 'hold'),
    ))
    .limit(1);
  if (existing.length > 0) return;

  const orderRows = await db().select().from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
  const order = orderRows[0];
  if (!order || order.paymentStatus !== 'paid') return;

  // Collect product IDs
  const productIds = new Set<string>();
  for (const so of order.subOrders) {
    for (const item of so.items) productIds.add(item.productId);
  }
  if (productIds.size === 0) return;

  // Look up sellerId per product
  const prodRows = await db()
    .select({ id: schema.products.id, sellerId: schema.products.sellerId })
    .from(schema.products)
    .where(sql`${schema.products.id} = ANY (${Array.from(productIds)}::uuid[])`);

  const productSellerMap = new Map<string, string>();
  for (const p of prodRows) {
    if (p.sellerId) productSellerMap.set(p.id, p.sellerId);
  }

  const sellerIds = Array.from(new Set([...productSellerMap.values()]));
  const sellerFeePctMap = new Map<string, number>();
  if (sellerIds.length > 0) {
    const sellerRows = await db()
      .select({ id: schema.sellers.id, fee: schema.sellers.platformFeePercent })
      .from(schema.sellers)
      .where(sql`${schema.sellers.id} = ANY (${sellerIds}::uuid[])`);
    for (const s of sellerRows) {
      sellerFeePctMap.set(s.id, Number(s.fee));
    }
  }

  const breakdowns = computeSellerBreakdown(order, productSellerMap, sellerFeePctMap);
  if (breakdowns.length === 0) return;

  await db().insert(schema.escrowLedger).values(breakdowns.map((b) => ({
    type: 'hold' as const,
    orderId: order.id,
    sellerId: b.sellerId,
    amount: String(b.subtotal),
    note: 'Held on payment verification',
  })));
}

/**
 * Buyer tapped "Confirm receipt" OR 7-day auto-release.
 * Idempotent.
 */
export async function releaseEscrowForOrder(
  orderId: string,
  reason: 'buyer_confirmed' | 'auto_release_7day' | 'admin_resolution',
  createdBy?: string,
): Promise<{ released: boolean; sellers: string[] }> {
  return await dbPool().transaction(async (tx) => {
    const locked = await tx.execute(sql`SELECT * FROM orders WHERE id = ${orderId} FOR UPDATE`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const order = locked.rows[0] as any;
    if (!order) return { released: false, sellers: [] };
    if (order.escrow_status === 'released') return { released: false, sellers: [] };

    const holds = await tx.execute(sql`
      SELECT id, seller_id, amount FROM escrow_ledger
      WHERE order_id = ${orderId} AND type = 'hold'
    `);
    if (holds.rows.length === 0) return { released: false, sellers: [] };

    const releasedSellers: string[] = [];
    for (const hold of holds.rows) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const h = hold as any;
      const sellerRow = await tx.execute(sql`
        SELECT platform_fee_percent FROM sellers WHERE id = ${h.seller_id}
      `);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const feePct = Number((sellerRow.rows[0] as any)?.platform_fee_percent ?? '5');
      const subtotal = Number(h.amount);
      const platformFee = Math.round(subtotal * (feePct / 100) * 100) / 100;
      const payable = Math.round((subtotal - platformFee) * 100) / 100;

      await tx.execute(sql`
        INSERT INTO escrow_ledger (type, order_id, seller_id, amount, note, created_by)
        VALUES ('release', ${orderId}, ${h.seller_id}, ${String(payable)},
                ${'Released via ' + reason}, ${createdBy ?? null})
      `);
      await tx.execute(sql`
        INSERT INTO escrow_ledger (type, order_id, seller_id, amount, note, created_by)
        VALUES ('platform_fee', ${orderId}, ${h.seller_id}, ${String(platformFee)},
                ${'Platform fee at ' + feePct + '%'}, ${createdBy ?? null})
      `);
      releasedSellers.push(h.seller_id);
    }

    await tx.execute(sql`
      UPDATE orders
      SET buyer_received_at = ${reason === 'buyer_confirmed' ? new Date() : null},
          escrow_status = 'released',
          status = 'completed',
          timeline = timeline || ${JSON.stringify([{
            status: 'completed',
            timestamp: new Date().toISOString(),
            note: 'Escrow released: ' + reason,
          }])}::jsonb,
          updated_at = now()
      WHERE id = ${orderId}
    `);

    return { released: true, sellers: releasedSellers };
  });
}

export async function getSellerEscrowSummary(sellerId: string): Promise<{
  pendingBalance: number;
  availableBalance: number;
  paidOut: number;
  recentEntries: Array<{
    id: string;
    type: string;
    amount: number;
    note: string;
    orderId: string;
    orderNumber: string;
    createdAt: Date;
  }>;
}> {
  const sumsRows = await db().execute(sql`
    SELECT type, COALESCE(SUM(amount::numeric), 0)::numeric AS total
    FROM escrow_ledger
    WHERE seller_id = ${sellerId}
    GROUP BY type
  `);
  const sums: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of sumsRows.rows as any[]) {
    sums[r.type] = Number(r.total);
  }

  // Pending = holds on orders whose escrow is still actually held.
  // (A flat sum of all holds never decreases after release/refund.)
  const pendingRows = await db().execute(sql`
    SELECT COALESCE(SUM(el.amount::numeric), 0)::numeric AS total
    FROM escrow_ledger el
    JOIN orders o ON o.id = el.order_id
    WHERE el.seller_id = ${sellerId}
      AND el.type = 'hold'
      AND o.escrow_status = 'held'
  `);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingHeld = Number((pendingRows.rows[0] as any)?.total ?? 0);

  const recentRows = await db().execute(sql`
    SELECT el.id, el.type, el.amount::numeric AS amount, el.note,
           el.order_id AS "orderId", o.order_number AS "orderNumber",
           el.created_at AS "createdAt"
    FROM escrow_ledger el
    LEFT JOIN orders o ON o.id = el.order_id
    WHERE el.seller_id = ${sellerId}
    ORDER BY el.created_at DESC
    LIMIT 10
  `);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recent = (recentRows.rows as any[]).map((r) => ({
    id: r.id,
    type: r.type,
    amount: Number(r.amount),
    note: r.note,
    orderId: r.orderId,
    orderNumber: r.orderNumber ?? '',
    createdAt: new Date(r.createdAt),
  }));

  return {
    pendingBalance: pendingHeld,
    availableBalance: (sums.release ?? 0) - (sums.payout ?? 0),
    paidOut: sums.payout ?? 0,
    recentEntries: recent,
  };
}

/**
 * Initiate a refund via Paystack Refund API.
 * Idempotent — refuses if a refund entry already exists for this order.
 */
export async function initiateRefund(
  orderId: string,
  reason: string,
  createdBy?: string,
): Promise<{ ok: boolean; error?: string }> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return { ok: false, error: 'PAYSTACK_SECRET_KEY not set' };

  const orderRows = await db().select().from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
  const order = orderRows[0];
  if (!order) return { ok: false, error: 'Order not found' };
  if (order.paymentStatus !== 'paid') return { ok: false, error: 'Order is not paid' };
  if (!order.paystackReference) return { ok: false, error: 'No Paystack reference on order' };

  const existing = await db()
    .select({ id: schema.escrowLedger.id })
    .from(schema.escrowLedger)
    .where(and(
      eq(schema.escrowLedger.orderId, orderId),
      eq(schema.escrowLedger.type, 'refund'),
    ))
    .limit(1);
  if (existing.length > 0) return { ok: false, error: 'Refund already initiated' };

  try {
    const res = await fetch(REFUND_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        transaction: order.paystackReference,
        customer_note: reason,
        merchant_note: `Order ${order.orderNumber}: ${reason}`,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return { ok: false, error: body?.message ?? `Paystack returned ${res.status}` };
    }
    const data = await res.json();
    const refundRef = data?.data?.transaction?.reference ?? '';

    await db().insert(schema.escrowLedger).values({
      type: 'refund',
      orderId: order.id,
      sellerId: null,
      amount: String(order.total),
      note: reason,
      externalRef: refundRef,
      createdBy: createdBy ?? null,
    });

    await db().update(schema.orders).set({
      escrowStatus: 'refunded',
      updatedAt: new Date(),
    }).where(eq(schema.orders.id, orderId));

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Refund request failed' };
  }
}