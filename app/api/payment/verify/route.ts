import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/session';
import { markOrderPaid } from '@/lib/checkout';
import { verifyTransaction } from '@/lib/paystack';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const inputSchema = z.object({
  reference: z.string().min(1).max(200),
});

/**
 * POST /api/payment/verify
 *
 * Called by /checkout/verify after Paystack redirects the user back.
 * Idempotent — if the webhook has already marked the order paid, this
 * still returns the success state.
 */
export async function POST(req: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let parsed: z.infer<typeof inputSchema>;
  try {
    const body = await req.json();
    parsed = inputSchema.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid reference' }, { status: 400 });
  }

  try {
    // Verify with Paystack first — they're the source of truth that
    // payment actually happened.
    const verification = await verifyTransaction(parsed.reference);

    if (verification.status !== 'success') {
      return NextResponse.json({
        status: verification.status === 'failed' ? 'failed' : 'pending',
        orderNumber: '',
        pickupCode: '',
        pickupLocation: '',
        total: 0,
      });
    }

    // Mark our order paid. Idempotent — webhook may have already done it.
    const { order } = await markOrderPaid(parsed.reference);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found for this reference' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'paid',
      orderNumber: order.orderNumber,
      pickupCode: order.pickupCode,
      pickupLocation: order.pickupLocation,
      total: order.total,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[payment/verify]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Verification failed' },
      { status: 500 }
    );
  }
}