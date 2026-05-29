import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@/db';
import { signToken } from '@/lib/auth';
import { setAuthCookie } from '@/lib/cookies';
import { loginSchema } from '@/lib/validators';
import { ok, fail, failValidation, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
      .where(eq(schema.users.email, parsed.email))
      .limit(1);
    const user = rows[0];

    // Timing-safe: run bcrypt even when user doesn't exist
    const PASSWORD_DUMMY = '$2a$12$abcdefghijklmnopqrstuv';
    const passwordOk = user
      ? await bcrypt.compare(parsed.password, user.password)
      : (await bcrypt.compare(parsed.password, PASSWORD_DUMMY).catch(() => false), false);

    if (!user || !passwordOk) {
      return fail('INVALID_CREDENTIALS', 'Wrong email or password.');
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