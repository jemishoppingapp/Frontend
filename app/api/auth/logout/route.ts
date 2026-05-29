import { clearAuthCookie } from '@/lib/cookies';
import { ok, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  return withErrorHandling(async () => {
    await clearAuthCookie();
    return ok({ signedOut: true });
  });
}