import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { dbPool } from '@/db/pool';
import { requireAdmin } from '@/lib/session';
import { ok, fail, failValidation, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending:   ['approved', 'rejected'],
  approved:  ['suspended'],
  suspended: ['approved'],
  rejected:  ['approved'],
};

const inputSchema = z.object({
  status: z.enum(['approved', 'rejected', 'suspended']),
  rejection_reason: z.string().trim().max(500).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    let admin;
    try {
      admin = await requireAdmin();
    } catch {
      return fail('FORBIDDEN', 'Admin access required.');
    }

    const { id } = await params;

    let parsed: z.infer<typeof inputSchema>;
    try {
      const body = await req.json();
      parsed = inputSchema.parse(body);
    } catch (err) {
      if (err instanceof z.ZodError) return failValidation(err);
      return fail('VALIDATION_ERROR', 'Invalid request body.');
    }

    if (parsed.status === 'rejected' && (!parsed.rejection_reason || parsed.rejection_reason.length < 5)) {
      return fail('VALIDATION_ERROR', 'A rejection reason of at least 5 characters is required.', 'rejection_reason');
    }

    // Use a transaction so we can both update the seller row and bulk-hide
    // their products atomically when suspending.
    return await dbPool().transaction(async (tx) => {
      // Lock the seller row
      const lockedRows = await tx.execute(sql`
        SELECT id, status, user_id FROM sellers WHERE id = ${id} FOR UPDATE
      `);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row = lockedRows.rows[0] as any;

      if (!row) {
        return fail('NOT_FOUND', 'Seller not found.');
      }

      const currentStatus = row.status as string;
      const allowed = VALID_TRANSITIONS[currentStatus] ?? [];
      if (!allowed.includes(parsed.status)) {
        return fail(
          'VALIDATION_ERROR',
          `Cannot move seller from "${currentStatus}" to "${parsed.status}".`
        );
      }

      // Update the seller row
      const updates: string[] = [`status = '${parsed.status}'`, `updated_at = now()`];
      const sqlParts: Array<{ name: string; value: unknown }> = [];

      if (parsed.status === 'approved') {
        sqlParts.push({ name: 'approved_at', value: new Date() });
        sqlParts.push({ name: 'approved_by', value: admin.id });
        // Clear any prior rejection reason
        sqlParts.push({ name: 'rejection_reason', value: '' });
      } else if (parsed.status === 'rejected') {
        sqlParts.push({ name: 'rejection_reason', value: parsed.rejection_reason ?? '' });
      }

      // Build dynamic UPDATE — use parameterized values
      await tx.execute(sql`
        UPDATE sellers
        SET status = ${parsed.status},
            approved_at = ${parsed.status === 'approved' ? new Date() : null},
            approved_by = ${parsed.status === 'approved' ? admin.id : null},
            rejection_reason = ${parsed.status === 'rejected' ? (parsed.rejection_reason ?? '') :
                                parsed.status === 'approved' ? '' : sql`rejection_reason`},
            updated_at = now()
        WHERE id = ${id}
      `);

      // Auto-hide products when suspending
      if (parsed.status === 'suspended') {
        await tx.execute(sql`
          UPDATE products
          SET is_active = false, updated_at = now()
          WHERE seller_id = ${id} AND is_active = true
        `);
      }

      // NOTE: We do NOT auto-restore products on reinstate. Admin can
      // re-activate them individually. This is a deliberate safety
      // measure — admin should verify the seller's products are
      // appropriate before bringing them back.

      // Suppress unused-var warning for sqlParts (we kept structure for clarity)
      void updates;
      void sqlParts;

      return ok({ status: parsed.status });
    });
  });
}