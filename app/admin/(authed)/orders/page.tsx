import type { Metadata } from 'next';
import Link from 'next/link';
import { and, desc, eq, ilike, or, sql, type SQL } from 'drizzle-orm';
import { ChevronRight, Search } from 'lucide-react';
import { db, schema } from '@/db';
import { formatCurrency, cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin Orders', robots: { index: false } };

const STATUS_LABEL: Record<string, string> = {
  pending: 'Awaiting payment', confirmed: 'Confirmed', processing: 'Processing',
  ready_for_pickup: 'Ready for pickup', completed: 'Completed', cancelled: 'Cancelled',
};
const STATUS_COLOR: Record<string, string> = {
  pending: 'text-warning bg-warning/10',
  confirmed: 'text-primary bg-primary/10',
  processing: 'text-primary bg-primary/10',
  ready_for_pickup: 'text-primary bg-primary/10',
  completed: 'text-fg-2 bg-surface-2',
  cancelled: 'text-danger bg-danger/10',
};

const FILTERS = [
  { slug: 'all', label: 'All' },
  { slug: 'pending', label: 'Pending' },
  { slug: 'confirmed', label: 'Confirmed' },
  { slug: 'processing', label: 'Processing' },
  { slug: 'ready_for_pickup', label: 'Ready' },
  { slug: 'completed', label: 'Completed' },
  { slug: 'cancelled', label: 'Cancelled' },
];

const PAGE_SIZE = 50;

type SearchParamsObj = { status?: string; q?: string; page?: string };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsObj>;
}) {
  const sp = await searchParams;
  const statusFilter = sp.status ?? 'all';
  const q = sp.q?.trim() ?? '';
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const conditions: SQL[] = [];
  const VALID_STATUSES = ['pending', 'confirmed', 'processing', 'ready_for_pickup', 'completed', 'cancelled'] as const;
  type OrderStatus = (typeof VALID_STATUSES)[number];
  if (statusFilter !== 'all' && (VALID_STATUSES as readonly string[]).includes(statusFilter)) {
    conditions.push(eq(schema.orders.status, statusFilter as OrderStatus));
  }
  if (q) {
    conditions.push(or(
      ilike(schema.orders.orderNumber, `%${q}%`),
      sql`EXISTS (SELECT 1 FROM users WHERE users.id = ${schema.orders.userId} AND (users.email ILIKE ${'%' + q + '%'} OR users.name ILIKE ${'%' + q + '%'}))`
    )!);
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countRows] = await Promise.all([
    db()
      .select({
        id: schema.orders.id,
        orderNumber: schema.orders.orderNumber,
        userId: schema.orders.userId,
        userEmail: schema.users.email,
        userName: schema.users.name,
        total: schema.orders.total,
        status: schema.orders.status,
        subOrders: schema.orders.subOrders,
        createdAt: schema.orders.createdAt,
      })
      .from(schema.orders)
      .leftJoin(schema.users, eq(schema.orders.userId, schema.users.id))
      .where(where)
      .orderBy(desc(schema.orders.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db()
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.orders)
      .where(where),
  ]);

  const total = countRows[0]?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function buildHref(over: Partial<SearchParamsObj>): string {
    const params = new URLSearchParams();
    const s = over.status ?? statusFilter;
    if (s !== 'all') params.set('status', s);
    const sq = over.q ?? q;
    if (sq) params.set('q', sq);
    const sp = over.page ?? '1';
    if (sp !== '1') params.set('page', sp);
    const qs = params.toString();
    return qs ? `/admin/orders?${qs}` : '/admin/orders';
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
      <div className="mb-7">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-fg mb-1">Orders</h1>
        <p className="text-sm text-fg-2">{total} order{total === 1 ? '' : 's'}</p>
      </div>

      {/* Filters + search */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
          {FILTERS.map((f) => {
            const active = f.slug === statusFilter;
            return (
              <Link
                key={f.slug}
                href={buildHref({ status: f.slug, page: '1' })}
                className={cn(
                  'shrink-0 inline-flex items-center px-3 h-9 rounded-full text-xs font-medium transition-colors border',
                  active
                    ? 'bg-fg text-fg-inverse border-fg'
                    : 'bg-surface text-fg-2 border-border hover:bg-surface-1'
                )}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        <form action="/admin/orders" method="get" className="flex items-center gap-2">
          {statusFilter !== 'all' && <input type="hidden" name="status" value={statusFilter} />}
          <div className="flex items-center bg-surface border border-border rounded-lg h-10 px-3 gap-2 flex-1 max-w-sm">
            <Search className="h-4 w-4 text-fg-2 shrink-0" />
            <input
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search by order # or buyer"
              className="flex-1 bg-transparent border-0 outline-none text-sm text-fg placeholder:text-fg-3"
            />
          </div>
          <button type="submit" className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover">
            Search
          </button>
        </form>
      </div>

      {/* Orders list */}
      <div className="bg-surface border border-border-soft rounded-2xl overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-fg-2">No orders match these filters.</div>
        ) : (
          <ul className="divide-y divide-border-soft">
            {rows.map((order) => {
              const itemCount = (order.subOrders as Array<{ items: Array<{ quantity: number }> }>).reduce(
                (s, so) => s + so.items.reduce((x, i) => x + i.quantity, 0), 0
              );
              return (
                <li key={order.id}>
                  <Link
                    href={`/admin/orders/${order.orderNumber}`}
                    className="flex items-center gap-3 px-5 py-4 hover:bg-surface-1 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-xs text-fg-3">{order.orderNumber}</span>
                        <span className={cn(
                          'inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full',
                          STATUS_COLOR[order.status] || 'text-fg-2 bg-surface-2'
                        )}>
                          {STATUS_LABEL[order.status] || order.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-fg mb-0.5">
                        {order.userName || 'Unknown buyer'}
                        <span className="text-fg-3 font-normal ml-2">{order.userEmail}</span>
                      </p>
                      <p className="text-xs text-fg-2">
                        {itemCount} item{itemCount === 1 ? '' : 's'} · {formatCurrency(Number(order.total))} ·{' '}
                        {new Date(order.createdAt).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-fg-3 shrink-0" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <Link
              href={buildHref({ page: String(page - 1) })}
              className="px-3 h-9 rounded-md text-sm font-medium bg-surface border border-border-soft hover:bg-surface-1 inline-flex items-center"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-fg-2">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link
              href={buildHref({ page: String(page + 1) })}
              className="px-3 h-9 rounded-md text-sm font-medium bg-surface border border-border-soft hover:bg-surface-1 inline-flex items-center"
            >
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}