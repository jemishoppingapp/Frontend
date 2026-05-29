import { NextResponse } from 'next/server';
import { expireStaleOrders } from '@/lib/checkout';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// Allow 30 seconds — this updates many rows in one statement
export const maxDuration = 30;

/**
 * Nightly Vercel Cron — expires pending orders older than 1 hour.
 *
 * Vercel attaches an Authorization header `Bearer ${CRON_SECRET}` to
 * cron invocations. We verify it so random visitors can't trigger this.
 * Generate CRON_SECRET once with `openssl rand -base64 32` and set it
 * in both .env.local AND Vercel environment variables.
 *
 * Schedule lives in vercel.json. Runs at 02:00 UTC (03:00 Lagos) daily.
 */
export async function GET(req: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');

  if (!expectedSecret) {
    // eslint-disable-next-line no-console
    console.error('[cron/cleanup-orders] CRON_SECRET not configured');
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 500 });
  }
  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    const expired = await expireStaleOrders();
    // eslint-disable-next-line no-console
    console.log(`[cron/cleanup-orders] expired ${expired} pending order(s)`);
    return NextResponse.json({ ok: true, expired });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[cron/cleanup-orders] failed:', err);
    return NextResponse.json({ ok: false, error: 'cleanup_failed' }, { status: 500 });
  }
}