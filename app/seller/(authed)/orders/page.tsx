import type { Metadata } from 'next';
import Link from 'next/link';
import { sql } from 'drizzle-orm';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { requireSeller } from '@/lib/seller-session';
import { formatCurrency, cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'My Orders', robots: { index: false } };

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

const PAGE_SIZE = 30;

const FILTERS = [
  { slug: 'all', label: 'All' },
  { slug: 'confirmed', label: 'Confirmed' },
  { slug: 'processing', label: 'Processing' },
  { slug: 'ready_for_pickup', label: 'Ready' },
  { slug: 'completed', label: 'Completed' },
];

type SearchParamsObj = { status?: string; page?: string };

export default async function SellerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsObj>;
}) {
  const { seller } = await requireSeller();
  const sp = await searchParams;
  const statusFilter = sp.status ?? 'all';
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // Find this seller's product IDs
  const sellerProducts = await db()
    .select({ id: schema.products.id })
    .from(schema.products)
    .where(eq(schema.products.sellerId, seller.id));
  const productIds = sellerProducts.map((p) => p.id);

  let rows: Array<{
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    createdAt: Date;
    sellerSubtotal: number;
    sellerItemCount: number;
    buyerName: string;
  }> = [];
  let total = 0;

  if (productIds.length > 0) {
    const statusClause = statusFilter !== 'all'
      ? sql`AND o.status = ${statusFilter}`
      : sql``;

    const orderRows = await db().execute(sql`
      SELECT
        o.id,
        o.order_number AS "orderNumber",
        o.status,
        o.payment_status AS "paymentStatus",
        o.created_at AS "createdAt",
        u.name AS "buyerName",
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
      LEFT JOIN users u ON u.id = o.user_id
      WHERE o.payment_status = 'paid'
        ${statusClause}
        AND EXISTS (
          SELECT 1
          FROM jsonb_array_elements(o.sub_orders) AS so,
               jsonb_array_elements(so->'items') AS item
          WHERE (item->>'productId')::uuid = ANY (${productIds}::uuid[])
        )
      ORDER BY o.created_at DESC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows = orderRows.rows.map((r: any) => ({
      id: r.id,
      orderNumber: r.orderNumber,
      status: r.status,
      paymentStatus: r.paymentStatus,
      createdAt: new Date(r.createdAt),
      sellerSubtotal: Number(r.sellerSubtotal),
      sellerItemCount: Number(r.sellerItemCount),
      buyerName: r.buyerName ?? 'Unknown',
    }));

    const totalRows = await db().execute(sql`
      SELECT COUNT(DISTINCT o.id)::int AS n FROM orders o
      WHERE o.payment_status = 'paid'
        ${statusClause}
        AND EXISTS (
          SELECT 1
          FROM jsonb_array_elements(o.sub_orders) AS so,
               jsonb_array_elements(so->'items') AS item
          WHERE (item->>'productId')::uuid = ANY (${productIds}::uuid[])
        )
    `);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    total = (totalRows.rows[0] as any)?.n ?? 0;
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function buildHref(over: Partial<SearchParamsObj>): string {
    const params = new URLSearchParams();
    const s = over.status ?? statusFilter;
    if (s !== 'all') params.set('status', s);
    const p = over.page ?? '1';
    if (p !== '1') params.set('page', p);
    const qs = params.toString();
    return qs ? `/seller/orders?${qs}` : '/seller/orders';
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
      <div className="mb-7">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-fg mb-1">Orders</h1>
        <p className="text-sm text-fg-2">{total} order{total === 1 ? '' : 's'} containing your items</p>
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 mb-6">
        {FILTERS.map((f) => {
          const active = f.slug === statusFilter;
          return (
            <Link key={f.slug} href={buildHref({ status: f.slug, page: '1' })}
              className={cn(
                'shrink-0 inline-flex items-center px-3 h-9 rounded-full text-xs font-medium transition-colors border',
                active ? 'bg-fg text-fg-inverse border-fg' : 'bg-surface text-fg-2 border-border hover:bg-surface-1'
              )}>
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="bg-surface border border-border-soft rounded-2xl overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="h-8 w-8 text-fg-3 mx-auto mb-3" />
            <p className="text-sm text-fg-2">
              {statusFilter !== 'all'
                ? <>No orders match this filter. <Link href="/seller/orders" className="text-primary hover:underline">Show all</Link></>
                : 'No orders containing your products yet.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border-soft">
            {rows.map((order) => (
              <li key={order.id}>
                <Link href={`/seller/orders/${order.orderNumber}`}
                  className="flex items-center gap-3 px-5 py-4 hover:bg-surface-1 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-[11px] text-fg-3">{order.orderNumber}</span>
                      <span className={cn(
                        'inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full',
                        STATUS_COLOR[order.status] || 'text-fg-2 bg-surface-2'
                      )}>
                        {STATUS_LABEL[order.status] || order.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-fg mb-0.5">
                      Buyer: {order.buyerName}
                    </p>
                    <p className="text-xs text-fg-2">
                      {order.sellerItemCount} item{order.sellerItemCount === 1 ? '' : 's'} ·{' '}
                      {formatCurrency(order.sellerSubtotal)} ·{' '}
                      {order.createdAt.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-fg-3 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <Link href={buildHref({ page: String(page - 1) })}
              className="px-3 h-9 rounded-md text-sm font-medium bg-surface border border-border-soft hover:bg-surface-1 inline-flex items-center">
              Previous
            </Link>
          )}
          <span className="text-sm text-fg-2">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={buildHref({ page: String(page + 1) })}
              className="px-3 h-9 rounded-md text-sm font-medium bg-surface border border-border-soft hover:bg-surface-1 inline-flex items-center">
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}