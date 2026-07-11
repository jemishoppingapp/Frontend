import { z } from 'zod';
import { eq, sql } from 'drizzle-orm';
import { db, schema } from '@/db';
import { dbPool } from '@/db/pool';
import { requireAuth } from '@/lib/session';
import { createPendingOrder } from '@/lib/checkout';
import { getPaymentMode } from '@/lib/payment-mode';
import { sendEmail } from '@/lib/email';
import { ok, fail, failValidation, withErrorHandling, ApiServerError } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const itemSchema = z.object({
  productId: z.string().uuid('Invalid product reference.'),
  quantity: z.number().int().min(1).max(99),
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
    // Guard: this route only works in POD mode.
    if (getPaymentMode() !== 'pod') {
      return fail('VALIDATION_ERROR', 'Pay on delivery is not currently available.');
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
    if (!user.email_verified) {
      return fail('FORBIDDEN', 'Please verify your email before checkout.');
    }

    let parsed: z.infer<typeof inputSchema>;
    try {
      const body = await req.json();
      parsed = inputSchema.parse(body);
    } catch (err) {
      if (err instanceof z.ZodError) return failValidation(err);
      return fail('VALIDATION_ERROR', 'Please check your inputs and try again.');
    }

    // Create the order with the same stock-locking logic Paystack uses.
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

    // POD: no Paystack. Move the order straight to confirmed +
    // pay_on_delivery, and record method as 'pod'. Stock was already
    // decremented inside createPendingOrder's transaction.
    await dbPool().transaction(async (tx) => {
      await tx.execute(sql`
        UPDATE orders
        SET status = 'confirmed',
            payment_status = 'pay_on_delivery',
            payment_method = 'pod',
            escrow_status = 'held',
            timeline = timeline || ${JSON.stringify([{
              status: 'confirmed',
              timestamp: new Date().toISOString(),
              note: 'Order placed — pay on delivery at the gate',
            }])}::jsonb,
            updated_at = now()
        WHERE id = ${result.orderId}
      `);
    });

    // Ops alert: tell JEMI a new POD order exists. Awaited so serverless
    // doesn't kill the send, but a failure NEVER breaks the checkout.
    try {
      const alertTo = process.env.ORDER_ALERT_EMAIL || process.env.SEED_ADMIN_EMAIL;
      if (alertTo) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jemi.com.ng';
        const gate = parsed.deliveryZone === 'lasu-iba-gate' ? 'LASU Iba Gate' : 'Iyana Iba Gate';
        const naira = new Intl.NumberFormat('en-NG').format(result.total);
        await sendEmail({
          to: alertTo,
          subject: `New order ${result.orderNumber} — collect NGN ${naira} at ${gate}`,
          html: `<div style=\"font-family:Arial,sans-serif;font-size:14px;color:#111\">`+
            `<p><strong>New pay-on-delivery order.</strong></p>`+
            `<p>Order: <strong>${result.orderNumber}</strong><br/>`+
            `Collect: <strong>NGN ${naira}</strong> (cash or transfer)<br/>`+
            `Gate: <strong>${gate}</strong><br/>`+
            `Where on campus: ${parsed.deliveryDescription}</p>`+
            `<p>Buyer: ${user.name} — ${user.phone || 'no phone'} — ${user.email}</p>`+
            `<p><a href=\"${siteUrl}/admin/orders/${result.orderNumber}\">Open in admin</a></p></div>`,
          text: `New POD order ${result.orderNumber}. Collect NGN ${naira} at ${gate}. Buyer: ${user.name} ${user.phone || ''}. ${siteUrl}/admin/orders/${result.orderNumber}`,
        });
      }
    } catch (e) {
      console.error('[order-alert]', e);
    }

    return ok({
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      mode: 'pod',
    });
  });
}