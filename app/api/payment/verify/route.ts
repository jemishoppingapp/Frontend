import { z } from 'zod';
import { requireAuth } from '@/lib/session';
import { markOrderPaid } from '@/lib/checkout';
import { verifyTransaction } from '@/lib/paystack';
import { ok, fail, failValidation, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const inputSchema = z.object({
  reference: z.string().min(1, 'Missing payment reference.').max(200),
});

export async function POST(req: Request) {
  return withErrorHandling(async () => {
    try {
      await requireAuth();
    } catch {
      return fail('UNAUTHORIZED', 'Please sign in to continue.');
    }

    let parsed: z.infer<typeof inputSchema>;
    try {
      const body = await req.json();
      parsed = inputSchema.parse(body);
    } catch (err) {
      if (err instanceof z.ZodError) return failValidation(err);
      return fail('VALIDATION_ERROR', 'Invalid payment reference.');
    }

    // Step 1: verify with Paystack
    let verification;
    try {
      verification = await verifyTransaction(parsed.reference);
    } catch (paystackErr) {
      // eslint-disable-next-line no-console
      console.error('[payment/verify] paystack verify failed:', paystackErr);
      return fail(
        'PAYMENT_VERIFY_FAILED',
        "We couldn't confirm with the payment provider. If you were charged, the order will be confirmed automatically — please check 'My orders' in a few minutes."
      );
    }

    if (verification.status !== 'success') {
      // Paystack itself responded — payment failed or pending on their end
      return fail(
        'PAYMENT_NOT_SUCCESSFUL',
        verification.status === 'failed'
          ? 'Payment was not successful. Please try again or use a different card.'
          : 'Payment is still being processed. Refresh in a moment to check status.'
      );
    }

    // Step 2: mark our order paid (idempotent)
    const { order } = await markOrderPaid(parsed.reference);
    if (!order) {
      return fail('ORDER_NOT_FOUND', "We received your payment but couldn't find the matching order. Contact support with this reference.");
    }

    return ok({
      status: 'paid' as const,
      orderNumber: order.orderNumber,
      pickupCode: order.pickupCode,
      pickupLocation: order.pickupLocation,
      total: order.total,
    });
  });
}