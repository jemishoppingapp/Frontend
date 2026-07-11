import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { issueAndSendOtp } from '@/lib/verification';
import { ok, fail, withErrorHandling } from '@/lib/api';
export const dynamic = 'force-dynamic'; export const runtime = 'nodejs';
export async function POST(req: Request) {
  return withErrorHandling(async () => {
    let email = '';
    try { const b = await req.json(); email = z.object({ email: z.string().trim().email() }).parse(b).email.toLowerCase(); }
    catch { return fail('VALIDATION_ERROR', 'Enter a valid email address.'); }
    const rows = await db().select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    const user = rows[0];
    if (user && !user.isDisabled) {
      // Throttled inside; errors are swallowed on purpose — the response
      // is identical whether or not an account exists.
      await issueAndSendOtp({
        id: user.id, email: user.email, name: user.name,
        otpLastSentAt: user.otpLastSentAt, otpSendCount: user.otpSendCount,
      }).catch((e) => console.error('[forgot]', e));
    }
    return ok({ sent: true });
  });
}