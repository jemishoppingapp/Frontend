import type { Metadata } from 'next';
import Link from 'next/link';
import { and, desc, eq, ilike, or, sql, type SQL } from 'drizzle-orm';
import { ChevronRight, Search, ShieldCheck, Ban, Clock, XCircle } from 'lucide-react';
import { db, schema } from '@/db';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin Sellers', robots: { index: false } };

const FILTERS = [
  { slug: 'all', label: 'All' },
  { slug: 'pending', label: 'Pending' },
  { slug: 'approved', label: 'Approved' },
  { slug: 'suspended', label: 'Suspended' },
  { slug: 'rejected', label: 'Rejected' },
];

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending review',
  approved: 'Approved',
  suspended: 'Suspended',
  rejected: 'Rejected',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'text-warning bg-warning/10',
  approved: 'text-success bg-success/10',
  suspended: 'text-danger bg-danger/10',
  rejected: 'text-fg-2 bg-surface-2',
};

const STATUS_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  approved: ShieldCheck,
  suspended: Ban,
  rejected: XCircle,
};

const PAGE_SIZE = 50;

const VALID_STATUSES = ['pending', 'approved', 'suspended', 'rejected'] as const;
type SellerStatus = (typeof VALID_STATUSES)[number];

type SearchParamsObj = { status?: string; q?: string; page?: string };

export default async function AdminSellersPage({
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
  if (statusFilter !== 'all' && (VALID_STATUSES as readonly string[]).includes(statusFilter)) {
    conditions.push(eq(schema.sellers.status, statusFilter as SellerStatus));
  }
  if (q) {
    conditions.push(or(
      ilike(schema.sellers.businessName, `%${q}%`),
      sql`EXISTS (SELECT 1 FROM users WHERE users.id = ${schema.sellers.userId} AND (users.email ILIKE ${'%' + q + '%'} OR users.name ILIKE ${'%' + q + '%'}))`
    )!);
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countRows, statusCountsRows] = await Promise.all([
    db()
      .select({
        id: schema.sellers.id,
        businessName: schema.sellers.businessName,
        businessTypeCategory: schema.sellers.businessTypeCategory,
        status: schema.sellers.status,
        appliedAt: schema.sellers.appliedAt,
        userEmail: schema.users.email,
        userName: schema.users.name,
      })
      .from(schema.sellers)
      .leftJoin(schema.users, eq(schema.sellers.userId, schema.users.id))
      .where(where)
      .orderBy(desc(schema.sellers.appliedAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db().select({ count: sql<number>`count(*)::int` }).from(schema.sellers).where(where),
    db()
      .select({ status: schema.sellers.status, count: sql<number>`count(*)::int` })
      .from(schema.sellers)
      .groupBy(schema.sellers.status),
  ]);

  const statusCounts: Record<string, number> = {};
  for (const row of statusCountsRows) {
    statusCounts[row.status] = row.count;
  }

  const total = countRows[0]?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function buildHref(over: Partial<SearchParamsObj>): string {
    const params = new URLSearchParams();
    const s = over.status ?? statusFilter;
    if (s !== 'all') params.set('status', s);
    const sq = over.q ?? q;
    if (sq) params.set('q', sq);
    const p = over.page ?? '1';
    if (p !== '1') params.set('page', p);
    const qs = params.toString();
    return qs ? `/admin/sellers?${qs}` : '/admin/sellers';
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
      <div className="mb-7">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-fg mb-1">Sellers</h1>
        <p className="text-sm text-fg-2">{total} seller{total === 1 ? '' : 's'}</p>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
          {FILTERS.map((f) => {
            const active = f.slug === statusFilter;
            const count = f.slug === 'all'
              ? Object.values(statusCounts).reduce((s, n) => s + n, 0)
              : statusCounts[f.slug] ?? 0;
            return (
              <Link key={f.slug} href={buildHref({ status: f.slug, page: '1' })}
                className={cn(
                  'shrink-0 inline-flex items-center gap-2 px-3 h-9 rounded-full text-xs font-medium transition-colors border',
                  active ? 'bg-fg text-fg-inverse border-fg' : 'bg-surface text-fg-2 border-border hover:bg-surface-1'
                )}>
                {f.label}
                {count > 0 && (
                  <span className={cn(
                    'inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-semibold',
                    active ? 'bg-fg-inverse text-fg' : 'bg-surface-2 text-fg-2'
                  )}>
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <form action="/admin/sellers" method="get" className="flex items-center gap-2">
          {statusFilter !== 'all' && <input type="hidden" name="status" value={statusFilter} />}
          <div className="flex items-center bg-surface border border-border rounded-lg h-10 px-3 gap-2 flex-1 max-w-sm">
            <Search className="h-4 w-4 text-fg-2 shrink-0" />
            <input name="q" type="search" defaultValue={q} placeholder="Search business name or email"
              className="flex-1 bg-transparent border-0 outline-none text-sm text-fg placeholder:text-fg-3" />
          </div>
          <button type="submit" className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover">
            Search
          </button>
        </form>
      </div>

      <div className="bg-surface border border-border-soft rounded-2xl overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-fg-2">
            {q || statusFilter !== 'all'
              ? <>No sellers match. <Link href="/admin/sellers" className="text-primary hover:underline">Clear filters</Link></>
              : <>No seller applications yet.</>}
          </div>
        ) : (
          <ul className="divide-y divide-border-soft">
            {rows.map((seller) => {
              const Icon = STATUS_ICON[seller.status] ?? Clock;
              return (
                <li key={seller.id}>
                  <Link href={`/admin/sellers/${seller.id}`}
                    className="flex items-center gap-3 px-5 py-4 hover:bg-surface-1 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-medium text-fg line-clamp-1">{seller.businessName}</p>
                        <span className={cn(
                          'inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full',
                          STATUS_COLOR[seller.status]
                        )}>
                          <Icon className="h-2.5 w-2.5" />
                          {STATUS_LABEL[seller.status]}
                        </span>
                      </div>
                      <p className="text-xs text-fg-2">
                        <span className="capitalize">{seller.businessTypeCategory}</span> ·{' '}
                        {seller.userName || 'Unknown'} ·{' '}
                        <span className="text-fg-3">{seller.userEmail}</span>
                      </p>
                      <p className="text-[11px] text-fg-3 mt-1">
                        Applied {new Date(seller.appliedAt).toLocaleString('en-NG', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
                        })}
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