import bcrypt from 'bcryptjs';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@/db';
import { signToken } from '@/lib/auth';
import { setAuthCookie } from '@/lib/cookies';
import { loginSchema } from '@/lib/validators';
import { ok, fail, failValidation, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function POST(req: Request) {
  return withErrorHandling(async () => {
    let parsed: z.infer<typeof loginSchema>;
    try {
      const body = await req.json();
      parsed = loginSchema.parse(body);
    } catch (err) {
      if (err instanceof z.ZodError) return failValidation(err);
      return fail('VALIDATION_ERROR', 'Please check your inputs and try again.');
    }

    const rows = await db()
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, parsed.email.toLowerCase()))
      .limit(1);
    const user = rows[0];

    // Locked? (Even a correct password waits out the lock.)
    if (user?.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const minutesLeft = Math.max(1, Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 60000));
      return fail('RATE_LIMITED', `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.`);
    }

    // Lock expired? Reset the counter before we judge this attempt.
    if (user?.lockedUntil && new Date(user.lockedUntil) <= new Date() && user.failedLoginAttempts > 0) {
      await db().execute(sql`
        UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ${user.id}
      `);
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
    }

    // Timing-safe: run bcrypt even when user doesn't exist
    const PASSWORD_DUMMY = '$2a$12$abcdefghijklmnopqrstuv';
    const passwordOk = user
      ? await bcrypt.compare(parsed.password, user.password)
      : (await bcrypt.compare(parsed.password, PASSWORD_DUMMY).catch(() => false), false);

    if (!user || !passwordOk) {
      if (user) {
        // Atomic increment; lock on the Nth failure.
        const updated = await db().execute(sql`
          UPDATE users
          SET failed_login_attempts = failed_login_attempts + 1,
              locked_until = CASE
                WHEN failed_login_attempts + 1 >= ${MAX_ATTEMPTS}
                THEN now() + (${LOCK_MINUTES} * interval '1 minute')
                ELSE locked_until
              END
          WHERE id = ${user.id}
          RETURNING failed_login_attempts
        `);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const attempts = Number((updated.rows[0] as any)?.failed_login_attempts ?? 0);
        if (attempts >= MAX_ATTEMPTS) {
          return fail('RATE_LIMITED', `Too many failed attempts. Try again in ${LOCK_MINUTES} minutes.`);
        }
      }
      return fail('INVALID_CREDENTIALS', 'Wrong email or password.');
    }

    // Correct password — but disabled accounts stay out.
    if (user.isDisabled) {
      return fail('FORBIDDEN', 'Your account has been disabled. Contact support.');
    }

    // Success: clear any failure history.
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await db().execute(sql`
        UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ${user.id}
      `);
    }

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