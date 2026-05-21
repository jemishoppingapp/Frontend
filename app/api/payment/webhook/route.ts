import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/paystack';
import { markOrderPaid } from '@/lib/checkout';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/payment/webhook — Paystack server-to-server.
 *
 * We read the RAW body (not parsed JSON) because the HMAC-SHA512
 * signature is computed over the exact bytes Paystack sent. Any
 * normalization (whitespace, key order) breaks verification.
 *
 * Paystack sends multiple event types. We handle `charge.success` for
 * marking orders paid. Other events (refund, transfer, etc.) are
 * acknowledged with 200 but ignored.
 *
 * Always respond 200 unless we genuinely failed to receive — Paystack
 * will retry non-2xx responses, and we don't want infinite retries on
 * application bugs that aren't transient.
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-paystack-signature');

  // Reject unsigned or wrong-signed requests
  const valid = await verifyWebhookSignature(rawBody, signature);
  if (!valid) {
    // eslint-disable-next-line no-console
    console.warn('[webhook] invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string; status?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // We only care about charge.success — that's the "money received" event.
  if (event.event !== 'charge.success' || !event.data?.reference) {
    // Acknowledge other events without doing anything.
    return NextResponse.json({ received: true });
  }

  try {
    const { order, alreadyPaid } = await markOrderPaid(event.data.reference);
    // eslint-disable-next-line no-console
    console.log(
      `[webhook] charge.success ref=${event.data.reference} order=${order?.orderNumber ?? 'NONE'} alreadyPaid=${alreadyPaid}`
    );
    return NextResponse.json({ received: true });
  } catch (err) {
    // Log but still 200 — Paystack will not retry, but the verify
    // endpoint will fix it when the user lands on /checkout/verify.
    // eslint-disable-next-line no-console
    console.error('[webhook] markOrderPaid failed:', err);
    return NextResponse.json({ received: true, internal: 'logged' });
  }
}