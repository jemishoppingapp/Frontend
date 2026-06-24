/**
 * Which payment mode the app runs in.
 *   'pod'      — pay on delivery: buyer pays JEMI's rep at the gate.
 *   'paystack' — online payment via Paystack (escrow flow).
 *
 * Set by PAYMENT_MODE env var. Defaults to 'pod' for the launch phase.
 * The client reads NEXT_PUBLIC_PAYMENT_MODE (same value).
 */
export type PaymentMode = 'pod' | 'paystack';

export function getPaymentMode(): PaymentMode {
  const m = (process.env.PAYMENT_MODE || 'pod').toLowerCase();
  return m === 'paystack' ? 'paystack' : 'pod';
}

/** Seller's share of a list price given a margin %. List minus margin. */
export function sellerShare(listPrice: number, marginPercent: number): number {
  const fee = Math.round(listPrice * (marginPercent / 100) * 100) / 100;
  return Math.round((listPrice - fee) * 100) / 100;
}