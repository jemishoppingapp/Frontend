import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@/db';
import { requireAuth } from '@/lib/session';
import { profileCompleteSchema } from '@/lib/validators';
import { ok, fail, failValidation, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  return withErrorHandling(async () => {
    let user;
    try {
      user = await requireAuth();
    } catch {
      return fail('UNAUTHORIZED', 'Please sign in to continue.');
    }

    let parsed: z.infer<typeof profileCompleteSchema>;
    try {
      const body = await req.json();
      parsed = profileCompleteSchema.parse(body);
    } catch (err) {
      if (err instanceof z.ZodError) return failValidation(err);
      return fail('VALIDATION_ERROR', 'Please check your inputs and try again.');
    }

    await db()
      .update(schema.users)
      .set({
        phone: parsed.phone,
        altPhone: parsed.alt_phone || '',
        address: parsed.address,
        department: parsed.department,
        level: parsed.level,
        profileCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, user.id));

    return ok({ saved: true });
  });
}