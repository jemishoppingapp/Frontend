import type { Metadata } from 'next';
import Link from 'next/link';
import { eq, sql } from 'drizzle-orm';
import { Package, ShoppingBag, Plus, ArrowRight, Wallet, Clock, CheckCircle2 } from 'lucide-react';
import { db, schema } from '@/db';
import { requireSeller } from '@/lib/seller-session';
import { getSellerEscrowSummary } from '@/lib/escrow-server';
import { formatCurrency, cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Seller Dashboard', robots: { index: false } };

const STATUS_LABEL: Record<string, string> = {
  pending: 'Awaiting payment',
  confirmed: 'Confirmed',
  processing: 'Processing',
  ready_for_pickup: 'Ready for pickup',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
const STATUS_COLOR: Record<string, string> = {
  pending: 'text-warning bg-warning/10',
  confirmed: 'text-primary bg-primary/10',
  processing: 'text-primary bg-primary/10',
  ready_for_pickup: 'text-primary bg-primary/10',
  completed: 'text-fg-2 bg-surface-2',
  cancelled: 'text-danger bg-danger/10',
};

const LEDGER_LABEL: Record<string, string> = {
  hold: 'Held (pending pickup)',
  release: 'Released to you',
  platform_fee: 'Platform fee',
  refund: 'Refunded',
  payout: 'Paid out',
};

const LEDGER_COLOR: Record<string, string> = {
  hold: 'text-warning',
  release: 'text-success',
  platform_fee: 'text-fg-3',
  refund: 'text-danger',
  payout: 'text-primary',
};

export default async function SellerDashboardPage() {
  const { seller } = await requireSeller();

  // Active product count + total
  const productRows = await db()
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where is_active = true)::int`,
    })
    .from(schema.products)
    .where(eq(schema.products.sellerId, seller.id));
  const totalProducts = productRows[0]?.total ?? 0;
  const activeProducts = productRows[0]?.active ?? 0;

  // Earnings summary
  const earnings = await getSellerEscrowSummary(seller.id);

  // Recent orders (top 8)
  const sellerProductRows = await db()
    .select({ id: schema.products.id })
    .from(schema.products)
    .where(eq(schema.products.sellerId, seller.id));
  const productIds = sellerProductRows.map((p) => p.id);

  let recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    createdAt: Date;
    sellerSubtotal: number;
    sellerItemCount: number;
  }> = [];
  let totalOrderCount = 0;

  if (productIds.length > 0) {
    const orderRows = await db().execute(sql`
      SELECT
        o.id, o.order_number AS "orderNumber", o.status,
        o.created_at AS "createdAt",
        (
          SELECT COALESCE(SUM((item->>'price')::numeric * (item->>'quantity')::int), 0)
          FROM jsonb_array_elements(o.sub_orders) AS so,
               jsonb_array_elements(so->'items') AS item
          WHERE (item->>'productId')::uuid = ANY (${productIds}::uuid[])
        )::numeric AS "sellerSubtotal",
        (
          SELECT COALESCE(SUM((item->>'quantity')::int), 0)
          FROM jsonb_array_elements(o.sub_orders) AS so,
               jsonb_array_elements(so->'items') AS item
          WHERE (item->>'productId')::uuid = ANY (${productIds}::uuid[])
        )::int AS "sellerItemCount"
      FROM orders o
      WHERE o.payment_status = 'paid'
        AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(o.sub_orders) AS so,
                       jsonb_array_elements(so->'items') AS item
          WHERE (item->>'productId')::uuid = ANY (${productIds}::uuid[])
        )
      ORDER BY o.created_at DESC LIMIT 8
    `);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recentOrders = orderRows.rows.map((r: any) => ({
      id: r.id,
      orderNumber: r.orderNumber,
      status: r.status,
      createdAt: new Date(r.createdAt),
      sellerSubtotal: Number(r.sellerSubtotal),
      sellerItemCount: Number(r.sellerItemCount),
    }));

    const totalRows = await db().execute(sql`
      SELECT COUNT(DISTINCT o.id)::int AS n FROM orders o
      WHERE o.payment_status = 'paid'
        AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(o.sub_orders) AS so,
                       jsonb_array_elements(so->'items') AS item
          WHERE (item->>'productId')::uuid = ANY (${productIds}::uuid[])
        )
    `);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    totalOrderCount = (totalRows.rows[0] as any)?.n ?? 0;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-fg mb-1">
        {seller.businessName}
      </h1>
      <p className="text-sm text-fg-2 mb-7">Your shop at a glance.</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-6">
        <div className="bg-surface border border-border-soft rounded-2xl p-4 lg:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-[0.15em] text-fg-2 font-medium">Active products</span>
            <Package className="h-4 w-4 text-fg-3" />
          </div>
          <p className="font-display text-2xl lg:text-3xl font-semibold text-fg leading-none">{activeProducts}</p>
          {totalProducts > activeProducts && (
            <p className="text-[11px] text-fg-3 mt-1">{totalProducts - activeProducts} hidden</p>
          )}
        </div>

        <div className="bg-surface border border-border-soft rounded-2xl p-4 lg:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-[0.15em] text-fg-2 font-medium">Orders</span>
            <ShoppingBag className="h-4 w-4 text-fg-3" />
          </div>
          <p className="font-display text-2xl lg:text-3xl font-semibold text-fg leading-none">{totalOrderCount}</p>
          <p className="text-[11px] text-fg-3 mt-1">total paid</p>
        </div>

        <Link href="/seller/products/new"
          className="bg-primary border border-primary rounded-2xl p-4 lg:p-5 text-primary-foreground hover:bg-primary-hover transition-colors flex flex-col justify-center">
          <Plus className="h-5 w-5 mb-2" />
          <p className="font-display text-base sm:text-lg font-semibold">Add product</p>
          <p className="text-[11px] opacity-80 mt-0.5">List something new</p>
        </Link>
      </div>

      {/* Earnings widget — real now */}
      <section className="bg-surface border border-border-soft rounded-2xl p-5 mb-8">
        <h2 className="font-display text-base font-semibold text-fg mb-4 inline-flex items-center gap-2">
          <Wallet className="h-4 w-4 text-fg-2" /> Earnings
        </h2>
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-fg-2 font-medium mb-1 inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> Pending
            </p>
            <p className="font-display text-lg sm:text-xl font-semibold text-warning leading-none">
              {formatCurrency(earnings.pendingBalance)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-fg-2 font-medium mb-1 inline-flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Available
            </p>
            <p className="font-display text-lg sm:text-xl font-semibold text-success leading-none">
              {formatCurrency(earnings.availableBalance)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-fg-2 font-medium mb-1">Paid out</p>
            <p className="font-display text-lg sm:text-xl font-semibold text-fg leading-none">
              {formatCurrency(earnings.paidOut)}
            </p>
          </div>
        </div>
        <div className="border-t border-border-soft pt-4">
          <p className="text-xs text-fg-2 mb-3">Recent activity</p>
          {earnings.recentEntries.length === 0 ? (
            <p className="text-xs text-fg-3">No transactions yet. Pending balance grows as orders are placed; available balance grows when orders complete.</p>
          ) : (
            <ul className="space-y-1.5">
              {earnings.recentEntries.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between text-xs">
                  <div className="flex-1 min-w-0">
                    <span className={cn('font-medium', LEDGER_COLOR[entry.type])}>
                      {LEDGER_LABEL[entry.type] ?? entry.type}
                    </span>
                    {entry.orderNumber && (
                      <Link href={`/seller/orders/${entry.orderNumber}`} className="ml-2 text-fg-3 font-mono hover:text-primary">
                        {entry.orderNumber}
                      </Link>
                    )}
                  </div>
                  <span className={cn('font-medium', LEDGER_COLOR[entry.type])}>
                    {entry.type === 'refund' || entry.type === 'payout' ? '−' : ''}
                    {formatCurrency(entry.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="text-[10px] text-fg-3 mt-3 leading-relaxed">
          Available balance is paid out manually by JEMI weekly or monthly per your preference. Payout history coming in next update.
        </p>
      </section>

      {/* Recent orders */}
      <section className="bg-surface border border-border-soft rounded-2xl overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-border-soft">
          <h2 className="font-display text-base font-semibold text-fg">Recent orders</h2>
          <Link href="/seller/orders" className="text-xs font-medium text-primary hover:text-primary-hover inline-flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </header>
        {recentOrders.length === 0 ? (
          <div className="p-10 text-center text-sm text-fg-2">
            No orders yet. {activeProducts === 0 ? (
              <Link href="/seller/products/new" className="text-primary hover:underline">List your first product →</Link>
            ) : 'Once buyers purchase your items, they will appear here.'}
          </div>
        ) : (
          <ul className="divide-y divide-border-soft">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link href={`/seller/orders/${order.orderNumber}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-surface-1 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-mono text-[11px] text-fg-3">{order.orderNumber}</span>
                      <span className={cn(
                        'inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full',
                        STATUS_COLOR[order.status] || 'text-fg-2 bg-surface-2'
                      )}>
                        {STATUS_LABEL[order.status] || order.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-fg">
                      {order.sellerItemCount} item{order.sellerItemCount === 1 ? '' : 's'} · {formatCurrency(order.sellerSubtotal)}
                    </p>
                  </div>
                  <span className="text-xs text-fg-2 whitespace-nowrap">
                    {order.createdAt.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}