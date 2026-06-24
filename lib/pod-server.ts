/**
 * POD settlement. When JEMI's agent collects payment at the gate and
 * marks the order delivered, we:
 *   1. record what was collected (amount + method) on the order
 *   2. mark payment_status = 'collected', status = 'completed'
 *   3. credit each seller their share (list price minus margin %) as a
 *      'release' entry in escrow_ledger — the SAME ledger the payout
 *      system reads, so POD earnings flow into the existing payout queue
 *
 * No Paystack, no hold entries. The money is real cash/transfer the agent
 * collected; the ledger just tracks what JEMI owes each seller.
 */
import { sql } from 'drizzle-orm';
import { db, schema } from '@/db';
import { dbPool } from '@/db/pool';

export interface PodDeliverResult {
  ok: boolean;
  error?: string;
  sellersCredited?: number;
}

/**
 * Mark a POD order collected + delivered, credit sellers.
 * Idempotent: if already collected, returns ok:false with a reason.
 */
export async function markPodCollectedAndDelivered(
  orderId: string,
  collected: { amount: number; method: 'cash' | 'transfer' },
  adminUserId: string,
): Promise<PodDeliverResult> {
  return await dbPool().transaction(async (tx) => {
    // Lock the order
    const locked = await tx.execute(sql`SELECT * FROM orders WHERE id = ${orderId} FOR UPDATE`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const order = locked.rows[0] as any;
    if (!order) return { ok: false, error: 'Order not found.' };

    if (order.payment_method !== 'pod') {
      return { ok: false, error: 'This is not a pay-on-delivery order.' };
    }
    if (order.payment_status === 'collected') {
      return { ok: false, error: 'This order was already collected and settled.' };
    }
    if (order.status === 'cancelled') {
      return { ok: false, error: 'This order is cancelled.' };
    }

    // Build productId -> sellerId map for the items in this order
    const productIds = new Set<string>();
    for (const so of order.sub_orders ?? []) {
      for (const item of so.items ?? []) productIds.add(item.productId);
    }

    const sellerTotals = new Map<string, number>(); // sellerId -> list subtotal
    if (productIds.size > 0) {
      const prodRows = await tx.execute(sql`
        SELECT id, seller_id, margin_percent
        FROM products
        WHERE id = ANY(${Array.from(productIds)}::uuid[])
      `);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prodMap = new Map((prodRows.rows as any[]).map((p) => [p.id, p]));

      for (const so of order.sub_orders ?? []) {
        for (const item of so.items ?? []) {
          const p = prodMap.get(item.productId);
          if (!p || !p.seller_id) continue; // JEMI-owned product, no seller to pay
          const lineTotal = Number(item.price) * Number(item.quantity);
          // store list subtotal; margin applied per-seller below
          const prev = sellerTotals.get(p.seller_id) ?? 0;
          sellerTotals.set(p.seller_id, prev + lineTotal);
        }
      }

      // Credit each seller their share (apply each seller's product margin).
      // We compute a weighted margin per seller from their products.
      for (const [sellerId] of sellerTotals) {
        // Recompute this seller's payable precisely from their line items
        let payable = 0;
        for (const so of order.sub_orders ?? []) {
          for (const item of so.items ?? []) {
            const p = prodMap.get(item.productId);
            if (!p || p.seller_id !== sellerId) continue;
            const lineTotal = Number(item.price) * Number(item.quantity);
            const margin = Number(p.margin_percent ?? 5);
            const fee = Math.round(lineTotal * (margin / 100) * 100) / 100;
            payable += lineTotal - fee;
          }
        }
        payable = Math.round(payable * 100) / 100;
        if (payable <= 0) continue;

        await tx.execute(sql`
          INSERT INTO escrow_ledger (type, order_id, seller_id, amount, note, created_by)
          VALUES ('release', ${orderId}, ${sellerId}, ${String(payable)},
                  'POD delivered — seller share credited', ${adminUserId})
        `);
      }
    }

    // Record collection + complete the order
    await tx.execute(sql`
      UPDATE orders
      SET payment_status = 'collected',
          status = 'completed',
          pod_collected_amount = ${String(collected.amount)},
          pod_collected_method = ${collected.method},
          pod_collected_at = now(),
          escrow_status = 'released',
          buyer_received_at = now(),
          timeline = timeline || ${JSON.stringify([{
            status: 'completed',
            timestamp: new Date().toISOString(),
            note: `Delivered — collected ${collected.method}`,
          }])}::jsonb,
          updated_at = now()
      WHERE id = ${orderId}
    `);

    return { ok: true, sellersCredited: sellerTotals.size };
  });
}