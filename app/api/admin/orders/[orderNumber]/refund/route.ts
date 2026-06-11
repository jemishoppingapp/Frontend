import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@/db';
import { requireAdmin } from '@/lib/session';
import { initiateRefund } from '@/lib/escrow-server';
import { ok, fail, failValidation, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const inputSchema = z.object({
  reason: z.string().trim().min(5, 'Please provide a reason (at least 5 characters).').max(500),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  return withErrorHandling(async () => {
    let admin;
    try {
      admin = await requireAdmin();
    } catch {
      return fail('FORBIDDEN', 'Admin access required.');
    }

    const { orderNumber } = await params;

    let parsed: z.infer<typeof inputSchema>;
    try {
      const body = await req.json();
      parsed = inputSchema.parse(body);
    } catch (err) {
      if (err instanceof z.ZodError) return failValidation(err);
      return fail('VALIDATION_ERROR', 'Invalid request body.');
    }

    const rows = await db().select().from(schema.orders).where(eq(schema.orders.orderNumber, orderNumber)).limit(1);
    const order = rows[0];
    if (!order) return fail('NOT_FOUND', 'Order not found.');

    const result = await initiateRefund(order.id, parsed.reason, admin.id);
    if (!result.ok) {
      return fail('VALIDATION_ERROR', result.error ?? 'Refund failed.');
    }

    // Also mark order as cancelled if not already
    if (order.status !== 'cancelled') {
      await db().update(schema.orders).set({
        status: 'cancelled',
        updatedAt: new Date(),
      }).where(eq(schema.orders.id, order.id));
    }

    return ok({ refunded: true });
  });
}