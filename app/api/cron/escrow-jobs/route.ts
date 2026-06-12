import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { releaseEscrowForOrder, initiateRefund } from '@/lib/escrow-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Hourly escrow jobs. Three passes, in this order:
 *
 * 1. AUTO-RELEASE (7 days): orders ready_for_pickup where EVERY seller
 *    holding escrow has marked delivered, but the buyer never confirmed.
 *    Assumes the buyer collected and forgot to tap. Releases all holds.
 *
 * 2. AUTO-CANCEL (7 days): orders ready_for_pickup where NO seller has
 *    marked delivered. Nobody showed up — refund the buyer via Paystack
 *    and cancel.
 *
 * 3. FLAG MIXED (14 days): some sellers marked delivered, some didn't.
 *    No automatic money movement — set escrow_status = 'awaiting_review'
 *    so an admin resolves it by hand.
 *
 * Orders in the mixed state are deliberately NOT touched by pass 1 or 2.
 *
 * Auth: accepts either Vercel's own cron header or a Bearer CRON_SECRET.
 */
export async function GET(req: Request) {
  const vercelCronHeader = req.headers.get('x-vercel-cron');
  const authHeader = req.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;

  const fromVercelCron = vercelCronHeader === '1';
  const hasSecret = !!expectedSecret && authHeader === `Bearer ${expectedSecret}`;

  if (!fromVercelCron && !hasSecret) {
    return new Response('Forbidden', { status: 403 });
  }

  const stats = {
    autoReleased: 0,
    autoCancelled: 0,
    flagged: 0,
    errors: [] as string[],
  };

  // ---- Pass 1: AUTO-RELEASE — all hold-sellers marked delivered,
  // buyer silent for 7+ days.
  try {
    const candidates = await db().execute(sql`
      SELECT o.id, o.order_number
      FROM orders o
      WHERE o.status = 'ready_for_pickup'
        AND o.payment_status = 'paid'
        AND o.buyer_received_at IS NULL
        AND o.escrow_status = 'held'
        AND o.updated_at < now() - INTERVAL '7 days'
        AND EXISTS (
          SELECT 1 FROM escrow_ledger el
          WHERE el.order_id = o.id AND el.type = 'hold'
        )
        AND NOT EXISTS (
          SELECT 1 FROM escrow_ledger el
          WHERE el.order_id = o.id AND el.type = 'hold'
            AND NOT (o.seller_delivery_marks ? el.seller_id::text)
        )
      LIMIT 50
    `);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const row of candidates.rows as any[]) {
      try {
        const r = await releaseEscrowForOrder(row.id, 'auto_release_7day');
        if (r.released) stats.autoReleased++;
      } catch (err) {
        stats.errors.push(`auto-release ${row.order_number}: ${err instanceof Error ? err.message : 'unknown'}`);
      }
    }
  } catch (err) {
    stats.errors.push(`auto-release query: ${err instanceof Error ? err.message : 'unknown'}`);
  }

  // ---- Pass 2: AUTO-CANCEL + REFUND — nobody delivered for 7+ days.
  try {
    const candidates = await db().execute(sql`
      SELECT o.id, o.order_number
      FROM orders o
      WHERE o.status = 'ready_for_pickup'
        AND o.payment_status = 'paid'
        AND o.escrow_status = 'held'
        AND (o.seller_delivery_marks IS NULL OR o.seller_delivery_marks = '{}'::jsonb)
        AND o.updated_at < now() - INTERVAL '7 days'
      LIMIT 50
    `);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const row of candidates.rows as any[]) {
      try {
        const r = await initiateRefund(row.id, 'Abandoned: no pickup within 7 days');
        if (r.ok) {
          stats.autoCancelled++;
          await db().execute(sql`
            UPDATE orders SET status = 'cancelled', updated_at = now()
            WHERE id = ${row.id}
          `);
        } else {
          stats.errors.push(`auto-cancel ${row.order_number}: ${r.error}`);
        }
      } catch (err) {
        stats.errors.push(`auto-cancel ${row.order_number}: ${err instanceof Error ? err.message : 'unknown'}`);
      }
    }
  } catch (err) {
    stats.errors.push(`auto-cancel query: ${err instanceof Error ? err.message : 'unknown'}`);
  }

  // ---- Pass 3: FLAG MIXED — some delivered, some not, 14+ days.
  try {
    const candidates = await db().execute(sql`
      SELECT o.id
      FROM orders o
      WHERE o.status = 'ready_for_pickup'
        AND o.payment_status = 'paid'
        AND o.buyer_received_at IS NULL
        AND o.escrow_status = 'held'
        AND o.updated_at < now() - INTERVAL '14 days'
        AND EXISTS (
          SELECT 1 FROM escrow_ledger el
          WHERE el.order_id = o.id AND el.type = 'hold'
            AND (o.seller_delivery_marks ? el.seller_id::text)
        )
        AND EXISTS (
          SELECT 1 FROM escrow_ledger el
          WHERE el.order_id = o.id AND el.type = 'hold'
            AND NOT (o.seller_delivery_marks ? el.seller_id::text)
        )
      LIMIT 50
    `);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const row of candidates.rows as any[]) {
      try {
        await db().execute(sql`
          UPDATE orders SET escrow_status = 'awaiting_review', updated_at = now()
          WHERE id = ${row.id}
        `);
        stats.flagged++;
      } catch (err) {
        stats.errors.push(`flag ${row.id}: ${err instanceof Error ? err.message : 'unknown'}`);
      }
    }
  } catch (err) {
    stats.errors.push(`flag query: ${err instanceof Error ? err.message : 'unknown'}`);
  }

  return Response.json({
    ok: true,
    timestamp: new Date().toISOString(),
    ...stats,
  });
}