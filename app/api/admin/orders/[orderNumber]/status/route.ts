import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { sql } from 'drizzle-orm';
import { dbPool } from '@/db/pool';
import { schema } from '@/db';
import { requireAdmin } from '@/lib/session';
import { ok, fail, failValidation, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['ready_for_pickup', 'cancelled'],
  ready_for_pickup: ['completed'],
  completed: [],
  cancelled: [],
};

const inputSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'ready_for_pickup', 'completed', 'cancelled']),
  note: z.string().trim().max(500).optional(),
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

    return await dbPool().transaction(async (tx) => {
      const lockedRows = await tx.execute(
        sql`SELECT id, status, payment_status, timeline FROM orders
            WHERE order_number = ${orderNumber}
            FOR UPDATE`
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row = lockedRows.rows[0] as any;

      if (!row) {
        return fail('ORDER_NOT_FOUND', 'That order does not exist.');
      }

      const currentStatus = row.status as string;
      const allowed = VALID_TRANSITIONS[currentStatus] ?? [];
      if (!allowed.includes(parsed.status)) {
        return fail(
          'VALIDATION_ERROR',
          `Cannot move order from "${currentStatus}" to "${parsed.status}".`
        );
      }

      const timelineEntry = {
        status: parsed.status,
        timestamp: new Date().toISOString(),
        note: parsed.note || `Updated by ${admin.name} (${admin.email})`,
        updatedBy: admin.email,
      };

      await tx.execute(
        sql`UPDATE orders
            SET status = ${parsed.status},
                timeline = timeline || ${JSON.stringify([timelineEntry])}::jsonb,
                updated_at = now()
            WHERE id = ${row.id}`
      );

      return ok({ orderNumber, status: parsed.status });
    });
  });
}