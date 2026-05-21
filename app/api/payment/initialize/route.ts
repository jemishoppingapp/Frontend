import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/session';
import { createPendingOrder, DELIVERY_ZONES } from '@/lib/checkout';
import { initializeTransaction } from '@/lib/paystack';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const itemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

const inputSchema = z.object({
  items: z.array(itemSchema).min(1),
  deliveryZone: z.enum(['lasu-iba-gate', 'iyana-iba-gate']),
  deliveryDescription: z.string().min(1).max(500),
  customerNote: z.string().max(500).default(''),
});

export async function POST(req: Request) {
  // Auth required
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validate input
  let parsed: z.infer<typeof inputSchema>;
  try {
    const body = await req.json();
    parsed = inputSchema.parse(body);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid input' },
      { status: 400 }
    );
  }

  try {
    // Create pending order, validate stock + recompute totals server-side
    const { orderId, orderNumber, reference, total } = await createPendingOrder({
      userId: user.id,
      userEmail: user.email,
      items: parsed.items,
      deliveryZone: parsed.deliveryZone,
      deliveryDescription: parsed.deliveryDescription,
      customerNote: parsed.customerNote,
    });

    // Call Paystack init
    const init = await initializeTransaction({
      email: user.email,
      amountNaira: total,
      reference,
      callback_url: `${SITE_URL}/checkout/verify`,
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
        user_id: user.id,
        delivery_zone: parsed.deliveryZone,
      },
    });

    return NextResponse.json({
      authorization_url: init.authorization_url,
      reference: init.reference,
      orderId,
      orderNumber,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Initialization failed';
    // eslint-disable-next-line no-console
    console.error('[payment/initialize]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}