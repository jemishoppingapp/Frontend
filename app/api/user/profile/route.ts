import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@/db';
import { requireAuth } from '@/lib/session';
import { profileUpdateSchema, passwordSchema } from '@/lib/validators';
import { ok, fail, failValidation, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return withErrorHandling(async () => {
    try {
      const user = await requireAuth();
      return ok({ user });
    } catch {
      return fail('UNAUTHORIZED', 'Please sign in to continue.');
    }
  });
}

const patchSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('profile') }).merge(profileUpdateSchema),
  z.object({
    kind: z.literal('password'),
    current_password: z.string().min(1, 'Please enter your current password.'),
    new_password: passwordSchema,
    confirm_password: z.string().min(1, 'Please confirm your new password.'),
  }),
]);

export async function PATCH(req: Request) {
  return withErrorHandling(async () => {
    let user;
    try {
      user = await requireAuth();
    } catch {
      return fail('UNAUTHORIZED', 'Please sign in to continue.');
    }

    let parsed: z.infer<typeof patchSchema>;
    try {
      const body = await req.json();
      parsed = patchSchema.parse(body);
    } catch (err) {
      if (err instanceof z.ZodError) return failValidation(err);
      return fail('VALIDATION_ERROR', 'Please check your inputs and try again.');
    }

    if (parsed.kind === 'profile') {
      const update: Record<string, unknown> = { updatedAt: new Date() };
      if (parsed.name !== undefined) update.name = parsed.name;
      if (parsed.nickname !== undefined) update.nickname = parsed.nickname;
      if (parsed.alt_phone !== undefined) update.altPhone = parsed.alt_phone;
      if (parsed.address !== undefined) update.address = parsed.address;
      if (parsed.department !== undefined) update.department = parsed.department;

      await db().update(schema.users).set(update).where(eq(schema.users.id, user.id));
      return ok({ saved: true });
    }

    if (parsed.new_password !== parsed.confirm_password) {
      return fail('PASSWORD_MISMATCH', "New passwords don't match.", 'confirm_password');
    }

    const rows = await db()
      .select({ password: schema.users.password })
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1);
    const row = rows[0];
    if (!row) {
      return fail('NOT_FOUND', 'Could not find your account.');
    }
    const currentOk = await bcrypt.compare(parsed.current_password, row.password);
    if (!currentOk) {
      return fail('WRONG_CURRENT_PASSWORD', 'Your current password is incorrect.', 'current_password');
    }
    const newHash = await bcrypt.hash(parsed.new_password, 12);
    await db()
      .update(schema.users)
      .set({ password: newHash, updatedAt: new Date() })
      .where(eq(schema.users.id, user.id));
    return ok({ saved: true });
  });
}