import type { Metadata } from 'next';
import Link from 'next/link';
import { desc, ilike, or, sql } from 'drizzle-orm';
import { ChevronRight, Search, ShieldCheck } from 'lucide-react';
import { db, schema } from '@/db';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin Users', robots: { index: false } };

const PAGE_SIZE = 50;

type SearchParamsObj = { q?: string; page?: string };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsObj>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? '';
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const where = q
    ? or(ilike(schema.users.email, `%${q}%`), ilike(schema.users.name, `%${q}%`))
    : undefined;

  const [rows, countRows] = await Promise.all([
    db().select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role,
      profileCompleted: schema.users.profileCompleted,
      createdAt: schema.users.createdAt,
    })
      .from(schema.users).where(where)
      .orderBy(desc(schema.users.createdAt)).limit(PAGE_SIZE).offset(offset),
    db().select({ count: sql<number>`count(*)::int` }).from(schema.users).where(where),
  ]);

  const total = countRows[0]?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function buildHref(over: Partial<SearchParamsObj>): string {
    const params = new URLSearchParams();
    const sq = over.q ?? q;
    if (sq) params.set('q', sq);
    const p = over.page ?? '1';
    if (p !== '1') params.set('page', p);
    const qs = params.toString();
    return qs ? `/admin/users?${qs}` : '/admin/users';
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
      <div className="mb-7">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-fg mb-1">Users</h1>
        <p className="text-sm text-fg-2">{total} user{total === 1 ? '' : 's'}</p>
      </div>

      <form action="/admin/users" method="get" className="flex items-center gap-2 mb-6">
        <div className="flex items-center bg-surface border border-border rounded-lg h-10 px-3 gap-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-fg-2 shrink-0" />
          <input name="q" type="search" defaultValue={q} placeholder="Search by email or name"
            className="flex-1 bg-transparent border-0 outline-none text-sm text-fg placeholder:text-fg-3" />
        </div>
        <button type="submit" className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover">
          Search
        </button>
      </form>

      <div className="bg-surface border border-border-soft rounded-2xl overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-fg-2">No users match.</div>
        ) : (
          <ul className="divide-y divide-border-soft">
            {rows.map((u) => (
              <li key={u.id}>
                <Link href={`/admin/users/${u.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-surface-1 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-fg line-clamp-1">{u.name}</p>
                      {u.role === 'admin' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          <ShieldCheck className="h-2.5 w-2.5" /> Admin
                        </span>
                      )}
                      {!u.profileCompleted && (
                        <span className="text-[10px] font-medium text-warning bg-warning/10 px-1.5 py-0.5 rounded">
                          Profile incomplete
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-fg-2">{u.email}</p>
                  </div>
                  <span className="text-xs text-fg-3 whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
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