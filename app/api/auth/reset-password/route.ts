import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { eq, sql } from 'drizzle-orm';
import { db, schema } from '@/db';
import { consumeOtp } from '@/lib/verification';
import { ok, fail, failValidation, withErrorHandling } from '@/lib/api';
export const dynamic = 'force-dynamic'; export const runtime = 'nodejs';

const inputSchema = z.object({
  email: z.string().trim().email(),
  code: z.string().trim().length(6),
  new_password: z.string().min(8, 'Password must be at least 8 characters.').max(72),
});

export async function POST(req: Request) {
  return withErrorHandling(async () => {
    let parsed: z.infer<typeof inputSchema>;
    try { parsed = inputSchema.parse(await req.json()); }
    catch (e) { if (e instanceof z.ZodError) return failValidation(e); return fail('VALIDATION_ERROR', 'Check your inputs.'); }
    if (!/[A-Za-z]/.test(parsed.new_password) || !/\d/.test(parsed.new_password)) {
      return fail('VALIDATION_ERROR', 'Password must contain a letter and a number.', 'new_password');
    }
    const rows = await db().select({ id: schema.users.id }).from(schema.users)
      .where(eq(schema.users.email, parsed.email.toLowerCase())).limit(1);
    const user = rows[0];
    // Same generic wrong-code message whether or not the account exists.
    if (!user) return fail('VALIDATION_ERROR', 'Wrong code. Check the email and try again.');
    const r = await consumeOtp(user.id, parsed.code);
    if (!r.ok) return fail('VALIDATION_ERROR', r.error);
    const hash = await bcrypt.hash(parsed.new_password, 12);
    await db().execute(sql`
      UPDATE users SET password = ${hash},
        failed_login_attempts = 0, locked_until = NULL, updated_at = now()
      WHERE id = ${user.id}`);
    return ok({ reset: true });
  });
}