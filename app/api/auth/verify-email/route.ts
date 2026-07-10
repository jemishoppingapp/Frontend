import { z } from 'zod';
import { requireAuth } from '@/lib/session';
import { verifyOtp } from '@/lib/verification';
import { ok, fail, withErrorHandling } from '@/lib/api';
export const dynamic = 'force-dynamic'; export const runtime = 'nodejs';
export async function POST(req: Request) {
  return withErrorHandling(async () => {
    let user; try { user = await requireAuth(); } catch { return fail('UNAUTHORIZED', 'Please sign in.'); }
    let code = '';
    try { const b = await req.json(); code = z.object({ code: z.string().trim().length(6) }).parse(b).code; }
    catch { return fail('VALIDATION_ERROR', 'Enter the 6-digit code.'); }
    const r = await verifyOtp(user.id, code);
    if (!r.ok) return fail('VALIDATION_ERROR', r.error);
    return ok({ verified: true });
  });
}