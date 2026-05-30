import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { and, desc, eq, ilike, or, sql, type SQL } from 'drizzle-orm';
import { ChevronRight, Plus, Search, Star } from 'lucide-react';
import { db, schema } from '@/db';
import { formatCurrency, cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin Products', robots: { index: false } };

const CATEGORIES = ['all', 'fashion', 'electronics', 'food', 'accessories'];
const PAGE_SIZE = 50;

type SearchParamsObj = { category?: string; q?: string; page?: string };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsObj>;
}) {
  const sp = await searchParams;
  const category = sp.category ?? 'all';
  const q = sp.q?.trim() ?? '';
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const conditions: SQL[] = [];
  if (category !== 'all') {
    conditions.push(eq(schema.products.category, category));
  }
  if (q) {
    conditions.push(or(
      ilike(schema.products.name, `%${q}%`),
      ilike(schema.products.slug, `%${q}%`)
    )!);
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countRows] = await Promise.all([
    db().select().from(schema.products).where(where)
      .orderBy(desc(schema.products.createdAt)).limit(PAGE_SIZE).offset(offset),
    db().select({ count: sql<number>`count(*)::int` }).from(schema.products).where(where),
  ]);

  const total = countRows[0]?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function buildHref(over: Partial<SearchParamsObj>): string {
    const params = new URLSearchParams();
    const c = over.category ?? category;
    if (c !== 'all') params.set('category', c);
    const sq = over.q ?? q;
    if (sq) params.set('q', sq);
    const p = over.page ?? '1';
    if (p !== '1') params.set('page', p);
    const qs = params.toString();
    return qs ? `/admin/products?${qs}` : '/admin/products';
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
      <div className="flex items-start justify-between gap-3 mb-7">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-fg mb-1">Products</h1>
          <p className="text-sm text-fg-2">{total} product{total === 1 ? '' : 's'}</p>
        </div>
        <Link href="/admin/products/new"
          className="inline-flex items-center gap-1.5 px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover shrink-0">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New product</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
          {CATEGORIES.map((c) => {
            const active = c === category;
            return (
              <Link key={c} href={buildHref({ category: c, page: '1' })}
                className={cn(
                  'shrink-0 inline-flex items-center px-3 h-9 rounded-full text-xs font-medium transition-colors border capitalize',
                  active ? 'bg-fg text-fg-inverse border-fg' : 'bg-surface text-fg-2 border-border hover:bg-surface-1'
                )}>
                {c}
              </Link>
            );
          })}
        </div>

        <form action="/admin/products" method="get" className="flex items-center gap-2">
          {category !== 'all' && <input type="hidden" name="category" value={category} />}
          <div className="flex items-center bg-surface border border-border rounded-lg h-10 px-3 gap-2 flex-1 max-w-sm">
            <Search className="h-4 w-4 text-fg-2 shrink-0" />
            <input name="q" type="search" defaultValue={q} placeholder="Search by name or slug"
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
            No products match.{' '}
            {q || category !== 'all' ? (
              <Link href="/admin/products" className="text-primary hover:underline">Clear filters</Link>
            ) : (
              <Link href="/admin/products/new" className="text-primary hover:underline">Create your first product →</Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-border-soft">
            {rows.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/products/${p.id}/edit`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-surface-1 transition-colors">
                  <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-lg overflow-hidden bg-surface-1">
                    {p.images?.[0]?.url && (
                      <Image src={p.images[0].url} alt={p.name} fill sizes="56px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-fg line-clamp-1">{p.name}</p>
                      {p.isFeatured && <Star className="h-3 w-3 fill-warning text-warning shrink-0" />}
                      {!p.isActive && <span className="text-[10px] font-medium text-danger bg-danger/10 px-1.5 py-0.5 rounded">Inactive</span>}
                    </div>
                    <p className="text-xs text-fg-2">
                      <span className="capitalize">{p.category}</span> · {formatCurrency(Number(p.price))} ·{' '}
                      <span className={cn(p.stockQuantity === 0 ? 'text-danger' : p.stockQuantity <= 5 ? 'text-warning' : '')}>
                        {p.stockQuantity} in stock
                      </span>
                      {p.images && p.images.length > 1 && (
                        <span className="ml-2 text-fg-3">· {p.images.length} images</span>
                      )}
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