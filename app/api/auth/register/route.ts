import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@/db';
import { signToken } from '@/lib/auth';
import { setAuthCookie } from '@/lib/cookies';
import { registerSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BCRYPT_ROUNDS = 12;  // ~250ms per hash on modern CPU

export async function POST(req: Request) {
  let parsed: z.infer<typeof registerSchema>;
  try {
    const body = await req.json();
    parsed = registerSchema.parse(body);
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
    // Check existing user
    const existing = await db()
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, parsed.email))
      .limit(1);

    if (existing.length > 0) {
      // Generic message — don't reveal which emails are registered
      return NextResponse.json(
        { error: 'Could not create account. Try logging in instead.' },
        { status: 409 }
      );
    }

    // Hash password and insert
    const hash = await bcrypt.hash(parsed.password, BCRYPT_ROUNDS);

    await db().insert(schema.users).values({
      email: parsed.email,
      password: hash,
      name: parsed.name,
      role: 'buyer',
      profileCompleted: false,
    });

    // Read back the row to get the id (Drizzle neon-http doesn't
    // support .returning() with all drivers consistently)
    const rows = await db()
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, parsed.email))
      .limit(1);

    const user = rows[0];
    if (!user) {
      throw new Error('Insert succeeded but user lookup failed');
    }

    // Sign in immediately — set cookie
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
    console.error('[api/auth/register]', err);
    return NextResponse.json(
      { error: 'Could not create account. Please try again.' },
      { status: 500 }
    );
  }
}