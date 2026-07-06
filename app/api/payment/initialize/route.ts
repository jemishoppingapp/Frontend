import { z } from 'zod';
import { requireAuth } from '@/lib/session';
import { createPendingOrder, deletePendingOrderByReference } from '@/lib/checkout';
import { initializeTransaction } from '@/lib/paystack';
import { getPaymentMode } from '@/lib/payment-mode';
import { ok, fail, failValidation, withErrorHandling, ApiServerError } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const itemSchema = z.object({
  productId: z.string().uuid('Invalid product reference.'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1.').max(99, 'Quantity is too high.'),
});

const inputSchema = z.object({
  items: z.array(itemSchema).min(1, 'Your cart is empty.'),
  deliveryZone: z.enum(['lasu-iba-gate', 'iyana-iba-gate'], {
    errorMap: () => ({ message: 'Please choose a pickup location.' }),
  }),
  deliveryDescription: z.string().trim().min(1, 'Please describe where on campus to deliver.').max(500),
  customerNote: z.string().trim().max(500).default(''),
});

export async function POST(req: Request) {
  return withErrorHandling(async () => {
    // Paystack checkout only runs when the site is in paystack mode.
    if (getPaymentMode() !== 'paystack') {
      return fail('VALIDATION_ERROR', 'Online payment is not available right now. Orders are pay on delivery.');
    }

    let user;
    try {
      user = await requireAuth();
    } catch {
      return fail('UNAUTHORIZED', 'Please sign in to checkout.');
    }
    if (!user.profile_completed) {
      return fail('PROFILE_INCOMPLETE', 'Please complete your profile before checking out.');
    }

    let parsed: z.infer<typeof inputSchema>;
    try {
      const body = await req.json();
      parsed = inputSchema.parse(body);
    } catch (err) {
      if (err instanceof z.ZodError) return failValidation(err);
      return fail('VALIDATION_ERROR', 'Please check your inputs and try again.');
    }

    // Step 1: create pending order (throws ApiServerError on stock issues)
    let result;
    try {
      result = await createPendingOrder({
        userId: user.id,
        userEmail: user.email,
        items: parsed.items,
        deliveryZone: parsed.deliveryZone,
        deliveryDescription: parsed.deliveryDescription,
        customerNote: parsed.customerNote,
      });
    } catch (err) {
      if (err instanceof ApiServerError) {
        return fail(err.code, err.message, err.field);
      }
      throw err;
    }

    // Step 2: call Paystack init. If this fails, we clean up the
    // pending order we just created — no orphan rows.
    try {
      const init = await initializeTransaction({
        email: user.email,
        amountNaira: result.total,
        reference: result.reference,
        callback_url: `${SITE_URL}/checkout/verify`,
        metadata: {
          order_id: result.orderId,
          order_number: result.orderNumber,
          user_id: user.id,
          delivery_zone: parsed.deliveryZone,
        },
      });

      return ok({
        authorization_url: init.authorization_url,
        reference: init.reference,
        orderId: result.orderId,
        orderNumber: result.orderNumber,
      });
    } catch (paystackErr) {
      // Clean up the pending order so we don't accumulate orphans
      try {
        await deletePendingOrderByReference(result.reference);
      } catch (cleanupErr) {
        // Worst case the cron will sweep it in an hour
        // eslint-disable-next-line no-console
        console.error('[payment/initialize] cleanup failed:', cleanupErr);
      }
      // eslint-disable-next-line no-console
      console.error('[payment/initialize] paystack init failed:', paystackErr);
      return fail(
        'PAYMENT_INIT_FAILED',
        "We couldn't reach the payment provider. Please try again in a moment."
      );
    }
  });
}