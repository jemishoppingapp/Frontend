import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { releaseEscrowForOrder, initiateRefund } from '@/lib/escrow-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Hourly cron job that processes:
 *
 * 1. AUTO-RELEASE: Orders where seller marked delivered 7+ days ago
 *    but buyer never confirmed -> release escrow to delivering sellers,
 *    mark order completed.
 *
 * 2. AUTO-CANCEL: Orders in 'ready_for_pickup' for 7+ days where NO
 *    seller has marked delivered -> refund buyer's card, cancel order.
 *
 * 3. FLAG MIXED: Orders in 'ready_for_pickup' for 14+ days where
 *    SOME (but not all) sellers marked delivered -> set escrow_status
 *    to 'awaiting_review' so admin can resolve manually.
 *
 * Security: BOTH a CRON_SECRET Bearer token AND Vercel's
 * x-vercel-cron header check.
 */
export async function GET(req: Request) {
  // Belt: check Vercel's automatic header (set by Vercel Cron only)
  const vercelCronHeader = req.headers.get('x-vercel-cron');
  // Suspenders: check our CRON_SECRET (also injected by Vercel from env)
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

  // ----- 1. AUTO-RELEASE: 7+ days since ready_for_pickup, at least
  // one seller marked delivered, buyer never confirmed.
  try {
    const candidates = await db().execute(sql`
      SELECT id, order_number FROM orders
      WHERE status = 'ready_for_pickup'
        AND payment_status = 'paid'
        AND buyer_received_at IS NULL
        AND seller_delivery_marks::text != '{}'
        AND updated_at < now() - INTERVAL '7 days'
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

  // ----- 2. AUTO-CANCEL + REFUND: 7+ days since ready_for_pickup,
  // NO seller marked delivered.
  try {
    const candidates = await db().execute(sql`
      SELECT id, order_number FROM orders
      WHERE status = 'ready_for_pickup'
        AND payment_status = 'paid'
        AND (seller_delivery_marks IS NULL OR seller_delivery_marks::text = '{}')
        AND updated_at < now() - INTERVAL '7 days'
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

  // ----- 3. FLAG MIXED: 14+ days, some sellers delivered, some not.
  // The cleanest detection: order has seller_delivery_marks but not all
  // sellers in the order have entries.
  try {
    const candidates = await db().execute(sql`
      WITH order_sellers AS (
        SELECT o.id AS order_id,
               COUNT(DISTINCT (item->>'productId')::uuid) AS item_count,
               COUNT(DISTINCT p.seller_id) FILTER (WHERE p.seller_id IS NOT NULL) AS seller_count,
               jsonb_object_keys(o.seller_delivery_marks) AS marked_seller
        FROM orders o,
             jsonb_array_elements(o.sub_orders) AS so,
             jsonb_array_elements(so->'items') AS item
        LEFT JOIN products p ON p.id = (item->>'productId')::uuid
        WHERE o.status = 'ready_for_pickup'
          AND o.payment_status = 'paid'
          AND o.buyer_received_at IS NULL
          AND o.updated_at < now() - INTERVAL '14 days'
          AND o.escrow_status != 'awaiting_review'
        GROUP BY o.id, marked_seller
      )
      SELECT order_id, seller_count, COUNT(marked_seller)::int AS marked_count
      FROM order_sellers
      GROUP BY order_id, seller_count
      HAVING COUNT(marked_seller) > 0 AND COUNT(marked_seller) < seller_count
      LIMIT 50
    `);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const row of candidates.rows as any[]) {
      try {
        await db().execute(sql`
          UPDATE orders SET escrow_status = 'awaiting_review', updated_at = now()
          WHERE id = ${row.order_id}
        `);
        stats.flagged++;
      } catch (err) {
        stats.errors.push(`flag ${row.order_id}: ${err instanceof Error ? err.message : 'unknown'}`);
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