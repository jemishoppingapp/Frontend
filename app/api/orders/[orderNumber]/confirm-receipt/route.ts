import { eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { requireAuth } from '@/lib/session';
import { releaseEscrowForOrder } from '@/lib/escrow-server';
import { ok, fail, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  return withErrorHandling(async () => {
    let user;
    try {
      user = await requireAuth();
    } catch {
      return fail('UNAUTHORIZED', 'Please sign in to continue.');
    }

    const { orderNumber } = await params;

    // Look up order — must belong to this user
    const rows = await db().select().from(schema.orders)
      .where(eq(schema.orders.orderNumber, orderNumber))
      .limit(1);
    const order = rows[0];
    if (!order) return fail('NOT_FOUND', 'Order not found.');
    if (order.userId !== user.id) return fail('FORBIDDEN', 'This is not your order.');

    if (order.paymentStatus !== 'paid') {
      return fail('VALIDATION_ERROR', 'Order is not paid.');
    }
    if (order.status !== 'ready_for_pickup' && order.status !== 'completed') {
      return fail('VALIDATION_ERROR', 'Order must be marked ready for pickup before confirming receipt.');
    }
    if (order.buyerReceivedAt) {
      return fail('VALIDATION_ERROR', 'You have already confirmed receipt for this order.');
    }

    const result = await releaseEscrowForOrder(order.id, 'buyer_confirmed', user.id);
    if (!result.released) {
      return fail('VALIDATION_ERROR', 'Could not release escrow. This may have been done already.');
    }

    return ok({ confirmed: true, sellersReleased: result.sellers.length });
  });
}