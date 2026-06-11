/**
 * Escrow helpers. All money math lives here so the API routes and
 * cron job share consistent logic.
 *
 * Money is stored as naira numeric (string in DB) and converted to
 * kobo only when talking to Paystack.
 */
import { sql } from 'drizzle-orm';
import type { Order } from '@/db/schema';

export interface SellerBreakdown {
  sellerId: string;
  subtotal: number;        // sum of (price * qty) for this seller's items
  platformFee: number;     // 5% of subtotal (Number(seller.platformFeePercent))
  payable: number;         // subtotal - platformFee
}

/**
 * Given an order and a map of productId -> sellerId, returns each
 * seller's portion of the order (subtotal, platform fee, payable).
 *
 * Buyers may pay for items that have no seller_id (legacy admin-owned
 * products); those items are skipped — money for them effectively
 * becomes JEMI's revenue, since there's no seller to pay.
 */
export function computeSellerBreakdown(
  order: { subOrders: Order['subOrders'] },
  productSellerMap: Map<string, string>,
  sellerFeePctMap: Map<string, number>,
): SellerBreakdown[] {
  const totals = new Map<string, number>();

  for (const so of order.subOrders) {
    for (const item of so.items) {
      const sellerId = productSellerMap.get(item.productId);
      if (!sellerId) continue;
      const itemTotal = item.price * item.quantity;
      totals.set(sellerId, (totals.get(sellerId) ?? 0) + itemTotal);
    }
  }

  const breakdowns: SellerBreakdown[] = [];
  for (const [sellerId, subtotal] of totals.entries()) {
    const feePct = sellerFeePctMap.get(sellerId) ?? 5;
    const platformFee = round2(subtotal * (feePct / 100));
    const payable = round2(subtotal - platformFee);
    breakdowns.push({ sellerId, subtotal: round2(subtotal), platformFee, payable });
  }
  return breakdowns;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Computes the next escrow_status value for an order given its
 * dual-confirm state.
 */
export function computeEscrowStatus(
  order: { sellerDeliveryMarks: Record<string, unknown>; buyerReceivedAt: Date | null; status: string },
  sellersInOrder: string[],
): 'held' | 'released' | 'refunded' | 'mixed' | 'awaiting_review' {
  if (order.status === 'cancelled') {
    return 'refunded';
  }
  if (order.buyerReceivedAt) {
    return 'released';
  }
  const marks = order.sellerDeliveryMarks ?? {};
  const deliveredCount = sellersInOrder.filter((sid) => sid in marks).length;
  if (deliveredCount === 0) return 'held';
  if (deliveredCount === sellersInOrder.length) return 'held'; // all delivered but buyer not yet confirmed
  return 'mixed';
}