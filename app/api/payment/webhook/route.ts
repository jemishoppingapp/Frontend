import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/paystack';
import { markOrderPaid } from '@/lib/checkout';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/payment/webhook
 *
 * Paystack server-to-server. We use raw text body for HMAC verify.
 * Webhooks deliberately DON'T use the standard envelope — Paystack
 * expects a plain 2xx body and we don't want a body shape change to
 * trigger their retry logic.
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-paystack-signature');

  const valid = await verifyWebhookSignature(rawBody, signature);
  if (!valid) {
    // eslint-disable-next-line no-console
    console.warn('[webhook] invalid signature');
    return NextResponse.json({ received: false, reason: 'signature' }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string; status?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ received: false, reason: 'json' }, { status: 400 });
  }

  if (event.event !== 'charge.success' || !event.data?.reference) {
    return NextResponse.json({ received: true, ignored: true });
  }

  try {
    const { order, alreadyPaid } = await markOrderPaid(event.data.reference);
    // eslint-disable-next-line no-console
    console.log(
      `[webhook] charge.success ref=${event.data.reference} order=${order?.orderNumber ?? 'NONE'} alreadyPaid=${alreadyPaid}`
    );
    return NextResponse.json({ received: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[webhook] markOrderPaid failed:', err);
    // Still return 200 — Paystack would retry endlessly otherwise.
    // The verify endpoint will fix it when the user lands on /checkout/verify.
    return NextResponse.json({ received: true, internal: 'logged' });
  }
}