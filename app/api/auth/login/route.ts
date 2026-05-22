import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@/db';
import { signToken } from '@/lib/auth';
import { setAuthCookie } from '@/lib/cookies';
import { loginSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  let parsed: z.infer<typeof loginSchema>;
  try {
    const body = await req.json();
    parsed = loginSchema.parse(body);
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
    const rows = await db()
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, parsed.email))
      .limit(1);

    const user = rows[0];

    // To prevent email-existence timing attacks, run a bcrypt compare
    // even when the user doesn't exist (against a known dummy hash).
    // This makes the response time roughly constant.
    const PASSWORD_DUMMY = '$2a$12$abcdefghijklmnopqrstuv';  // not a real hash
    const passwordOk = user
      ? await bcrypt.compare(parsed.password, user.password)
      : (await bcrypt.compare(parsed.password, PASSWORD_DUMMY).catch(() => false), false);

    if (!user || !passwordOk) {
      return NextResponse.json(
        { error: 'Wrong email or password' },
        { status: 401 }
      );
    }

    const token = await signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    await setAuthCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile_completed: user.profileCompleted,
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api/auth/login]', err);
    return NextResponse.json(
      { error: 'Could not sign you in. Please try again.' },
      { status: 500 }
    );
  }
}