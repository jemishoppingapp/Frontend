import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@/db';
import { signToken } from '@/lib/auth';
import { setAuthCookie } from '@/lib/cookies';
import { registerSchema } from '@/lib/validators';
import { ok, fail, failValidation, withErrorHandling } from '@/lib/api';
import { issueAndSendOtp } from '@/lib/verification';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BCRYPT_ROUNDS = 12;

export async function POST(req: Request) {
  return withErrorHandling(async () => {
    let parsed: z.infer<typeof registerSchema>;
    try {
      const body = await req.json();
      parsed = registerSchema.parse(body);
    } catch (err) {
      if (err instanceof z.ZodError) return failValidation(err);
      return fail('VALIDATION_ERROR', 'Please check your inputs and try again.');
    }

    const existing = await db()
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, parsed.email))
      .limit(1);

    if (existing.length > 0) {
      return fail('EMAIL_TAKEN', 'An account with that email already exists. Try signing in instead.', 'email');
    }

    const hash = await bcrypt.hash(parsed.password, BCRYPT_ROUNDS);

    await db().insert(schema.users).values({
      email: parsed.email,
      password: hash,
      name: parsed.name,
      role: 'buyer',
      profileCompleted: false,
    });

    const rows = await db()
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, parsed.email))
      .limit(1);

    const user = rows[0];
    if (!user) {
      return fail('SERVER_ERROR', 'We saved your account but could not sign you in. Please try logging in.');
    }

    // Send the first verification code; never block signup on email.
    issueAndSendOtp({ id: user.id, email: user.email, name: user.name }).catch((e) => console.error('[otp]', e));

    const token = await signToken({ sub: user.id, email: user.email, role: user.role });
    await setAuthCookie(token);

    return ok({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile_completed: user.profileCompleted,
      },
    });
  });
}