import { z } from 'zod';
import { requireAdmin } from '@/lib/session';
import { createPayout } from '@/lib/payouts-server';
import { ok, fail, failValidation, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const inputSchema = z.object({
  sellerId: z.string().uuid(),
  method: z.enum(['manual', 'paystack']),
  transferRef: z.string().trim().max(200).optional(),
  note: z.string().trim().max(500).optional(),
});

export async function POST(req: Request) {
  return withErrorHandling(async () => {
    let admin;
    try {
      admin = await requireAdmin();
    } catch {
      return fail('FORBIDDEN', 'Admin access required.');
    }

    let parsed: z.infer<typeof inputSchema>;
    try {
      const body = await req.json();
      parsed = inputSchema.parse(body);
    } catch (err) {
      if (err instanceof z.ZodError) return failValidation(err);
      return fail('VALIDATION_ERROR', 'Invalid request body.');
    }

    // For manual payouts, a reference is recommended but not required.
    const result = await createPayout(parsed.sellerId, parsed.method, {
      transferRef: parsed.transferRef,
      note: parsed.note,
      createdBy: admin.id,
    });

    if (!result.ok) {
      return fail('VALIDATION_ERROR', result.error ?? 'Payout failed.');
    }

    return ok({ payoutId: result.payoutId });
  });
}