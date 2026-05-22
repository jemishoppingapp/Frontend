import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@/db';
import { requireAuth } from '@/lib/session';
import { profileUpdateSchema, passwordSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await requireAuth();
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

/**
 * PATCH /api/user/profile
 * Updates basic profile fields. Optional password change via separate
 * `change_password` payload shape — done in the same endpoint so the
 * UI doesn't need two round-trips.
 *
 * We use a discriminated union on `kind`. The password branch validates
 * that new and confirm match AFTER the union parse (zod can't call
 * .refine() and then .extend() on the resulting ZodEffects).
 */
const patchSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('profile') }).merge(profileUpdateSchema),
  z.object({
    kind: z.literal('password'),
    current_password: z.string().min(1, 'Please enter your current password'),
    new_password: passwordSchema,
    confirm_password: z.string().min(1, 'Please confirm your new password'),
  }),
]);

export async function PATCH(req: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let parsed;
  try {
    const body = await req.json();
    parsed = patchSchema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message ?? 'Invalid input' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    if (parsed.kind === 'profile') {
      // Build a clean update object (only fields the user sent)
      const update: Record<string, unknown> = { updatedAt: new Date() };
      if (parsed.name !== undefined) update.name = parsed.name;
      if (parsed.nickname !== undefined) update.nickname = parsed.nickname;
      if (parsed.alt_phone !== undefined) update.altPhone = parsed.alt_phone;
      if (parsed.address !== undefined) update.address = parsed.address;
      if (parsed.department !== undefined) update.department = parsed.department;

      await db().update(schema.users).set(update).where(eq(schema.users.id, user.id));
      return NextResponse.json({ ok: true });
    }

    if (parsed.kind === 'password') {
      // post-parse check: zod's discriminatedUnion doesn't let us
      // .refine() one branch, so we validate password match here.
      if (parsed.new_password !== parsed.confirm_password) {
        return NextResponse.json(
          { error: "New passwords don't match" },
          { status: 400 }
        );
      }

      // Re-fetch the password hash (requireAuth's CurrentUser doesn't
      // expose it for safety)
      const rows = await db()
        .select({ password: schema.users.password })
        .from(schema.users)
        .where(eq(schema.users.id, user.id))
        .limit(1);
      const row = rows[0];
      if (!row) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      const currentOk = await bcrypt.compare(parsed.current_password, row.password);
      if (!currentOk) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
      }
      const newHash = await bcrypt.hash(parsed.new_password, 12);
      await db()
        .update(schema.users)
        .set({ password: newHash, updatedAt: new Date() })
        .where(eq(schema.users.id, user.id));
      return NextResponse.json({ ok: true });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api/user/profile]', err);
    return NextResponse.json(
      { error: 'Could not update profile. Please try again.' },
      { status: 500 }
    );
  }
}