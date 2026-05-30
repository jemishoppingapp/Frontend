import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { desc, eq, sql } from 'drizzle-orm';
import { ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { db, schema } from '@/db';
import { formatCurrency, cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'User Detail', robots: { index: false } };

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

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const rows = await db().select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  const user = rows[0];
  if (!user) notFound();

  const [orders, statsRows] = await Promise.all([
    db().select().from(schema.orders).where(eq(schema.orders.userId, user.id))
      .orderBy(desc(schema.orders.createdAt)).limit(10),
    db().select({
      orderCount: sql<number>`count(*)::int`,
      totalSpent: sql<string>`coalesce(sum(case when payment_status = 'paid' then total else 0 end), 0)::text`,
    }).from(schema.orders).where(eq(schema.orders.userId, user.id)),
  ]);

  const orderCount = statsRows[0]?.orderCount ?? 0;
  const totalSpent = Number(statsRows[0]?.totalSpent ?? '0');

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-4xl">
      <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm text-fg-2 hover:text-fg mb-5">
        <ChevronLeft className="h-4 w-4" /> All users
      </Link>

      <div className="mb-7">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-fg">{user.name}</h1>
          {user.role === 'admin' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <ShieldCheck className="h-2.5 w-2.5" /> Admin
            </span>
          )}
        </div>
        <p className="text-sm text-fg-2">{user.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-surface border border-border-soft rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-[0.15em] text-fg-2 font-medium mb-2">Orders</p>
          <p className="font-display text-2xl font-semibold text-fg">{orderCount}</p>
        </div>
        <div className="bg-surface border border-border-soft rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-[0.15em] text-fg-2 font-medium mb-2">Total spent</p>
          <p className="font-display text-2xl font-semibold text-fg">{formatCurrency(totalSpent)}</p>
        </div>
      </div>

      <section className="bg-surface border border-border-soft rounded-2xl p-6 mb-6">
        <h2 className="font-display text-base font-semibold text-fg mb-4">Profile</h2>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><dt className="text-fg-2 text-xs mb-0.5">Phone</dt><dd className="text-fg">{user.phone || '—'}</dd></div>
          <div><dt className="text-fg-2 text-xs mb-0.5">Alt phone</dt><dd className="text-fg">{user.altPhone || '—'}</dd></div>
          <div className="sm:col-span-2"><dt className="text-fg-2 text-xs mb-0.5">Address</dt><dd className="text-fg">{user.address || '—'}</dd></div>
          <div><dt className="text-fg-2 text-xs mb-0.5">Department</dt><dd className="text-fg">{user.department || '—'}</dd></div>
          <div><dt className="text-fg-2 text-xs mb-0.5">Level</dt><dd className="text-fg">{user.level || '—'}</dd></div>
          <div><dt className="text-fg-2 text-xs mb-0.5">Joined</dt><dd className="text-fg">
            {new Date(user.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
          </dd></div>
          <div><dt className="text-fg-2 text-xs mb-0.5">Profile</dt>
            <dd className={user.profileCompleted ? 'text-success' : 'text-warning'}>
              {user.profileCompleted ? 'Completed' : 'Incomplete'}
            </dd>
          </div>
        </dl>
      </section>

      <section className="bg-surface border border-border-soft rounded-2xl overflow-hidden">
        <header className="px-5 py-4 border-b border-border-soft">
          <h2 className="font-display text-base font-semibold text-fg">Recent orders</h2>
        </header>
        {orders.length === 0 ? (
          <div className="p-8 text-center text-sm text-fg-2">No orders yet.</div>
        ) : (
          <ul className="divide-y divide-border-soft">
            {orders.map((order) => (
              <li key={order.id}>
                <Link href={`/admin/orders/${order.orderNumber}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-surface-1 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-[11px] text-fg-3">{order.orderNumber}</span>
                      <span className={cn(
                        'inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full',
                        STATUS_COLOR[order.status] || 'text-fg-2 bg-surface-2'
                      )}>
                        {STATUS_LABEL[order.status] || order.status}
                      </span>
                    </div>
                    <p className="text-sm text-fg">{formatCurrency(Number(order.total))}</p>
                  </div>
                  <span className="text-xs text-fg-2 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                  </span>
                  <ChevronRight className="h-4 w-4 text-fg-3 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}