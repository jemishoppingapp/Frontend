import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@/db';
import { requireAuth } from '@/lib/session';
import { profileCompleteSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/user/profile/complete
 *
 * Sets all the profile fields required before a buyer can checkout:
 *   phone (primary), alt_phone, address, department, level
 * Flips profile_completed to true.
 *
 * Idempotent — calling it again with new values updates them.
 */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let parsed: z.infer<typeof profileCompleteSchema>;
  try {
    const body = await req.json();
    parsed = profileCompleteSchema.parse(body);
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

    return NextResponse.json({ ok: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api/user/profile/complete]', err);
    return NextResponse.json(
      { error: 'Could not save profile. Please try again.' },
      { status: 500 }
    );
  }
}