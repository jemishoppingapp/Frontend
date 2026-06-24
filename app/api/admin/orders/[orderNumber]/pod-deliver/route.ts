import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@/db';
import { requireAdmin } from '@/lib/session';
import { markPodCollectedAndDelivered } from '@/lib/pod-server';
import { ok, fail, failValidation, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const inputSchema = z.object({
  amount: z.number().min(0, 'Amount must be zero or more.'),
  method: z.enum(['cash', 'transfer'], {
    errorMap: () => ({ message: 'Choose cash or transfer.' }),
  }),
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

    const rows = await db().select({ id: schema.orders.id })
      .from(schema.orders)
      .where(eq(schema.orders.orderNumber, orderNumber))
      .limit(1);
    const order = rows[0];
    if (!order) return fail('NOT_FOUND', 'Order not found.');

    const result = await markPodCollectedAndDelivered(
      order.id,
      { amount: parsed.amount, method: parsed.method },
      admin.id,
    );
    if (!result.ok) {
      return fail('VALIDATION_ERROR', result.error ?? 'Could not complete delivery.');
    }

    return ok({ delivered: true, sellersCredited: result.sellersCredited ?? 0 });
  });
}