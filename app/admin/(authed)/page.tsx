import type { Metadata } from 'next';
import Link from 'next/link';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import {
  ShoppingBag, DollarSign, Clock, AlertTriangle, ArrowRight,
} from 'lucide-react';
import { db, schema } from '@/db';
import { formatCurrency, cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: { index: false },
};

async function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const [ordersTodayRows, revenueTodayRows, pendingCountRows, lowStockRows, recentOrdersRows, lowStockListRows] = await Promise.all([
      db()
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.orders)
        .where(gte(schema.orders.createdAt, today)),
      db()
        .select({ total: sql<string>`coalesce(sum(total), 0)::text` })
        .from(schema.orders)
        .where(and(
          gte(schema.orders.createdAt, today),
          eq(schema.orders.paymentStatus, 'paid')
        )),
      db()
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.orders)
        .where(eq(schema.orders.status, 'pending')),
      db()
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.products)
        .where(and(
          eq(schema.products.isActive, true),
          lte(schema.products.stockQuantity, 5)
        )),
      db()
        .select()
        .from(schema.orders)
        .orderBy(desc(schema.orders.createdAt))
        .limit(8),
      db()
        .select({
          id: schema.products.id,
          slug: schema.products.slug,
          name: schema.products.name,
          stockQuantity: schema.products.stockQuantity,
        })
        .from(schema.products)
        .where(and(
          eq(schema.products.isActive, true),
          lte(schema.products.stockQuantity, 5)
        ))
        .orderBy(schema.products.stockQuantity)
        .limit(8),
    ]);

    return {
      ordersToday: ordersTodayRows[0]?.count ?? 0,
      revenueToday: Number(revenueTodayRows[0]?.total ?? '0'),
      pendingCount: pendingCountRows[0]?.count ?? 0,
      lowStockCount: lowStockRows[0]?.count ?? 0,
      recentOrders: recentOrdersRows,
      lowStockProducts: lowStockListRows,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[admin/dashboard] stats failed:', err);
    return {
      ordersToday: 0, revenueToday: 0, pendingCount: 0, lowStockCount: 0,
      recentOrders: [], lowStockProducts: [],
    };
  }
}

const STATUS_LABEL = {
  pending: 'Awaiting payment', confirmed: 'Confirmed', processing: 'Processing',
  ready_for_pickup: 'Ready for pickup', completed: 'Completed', cancelled: 'Cancelled',
};
const STATUS_COLOR = {
  pending: 'text-warning bg-warning/10',
  confirmed: 'text-primary bg-primary/10',
  processing: 'text-primary bg-primary/10',
  ready_for_pickup: 'text-primary bg-primary/10',
  completed: 'text-fg-2 bg-surface-2',
  cancelled: 'text-danger bg-danger/10',
};

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-fg mb-1">Dashboard</h1>
      <p className="text-sm text-fg-2 mb-7">Today's activity at a glance.</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
        <StatCard
          icon={ShoppingBag}
          label="Orders today"
          value={stats.ordersToday.toString()}
        />
        <StatCard
          icon={DollarSign}
          label="Revenue today"
          value={formatCurrency(stats.revenueToday)}
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={stats.pendingCount.toString()}
          warning={stats.pendingCount > 0}
        />
        <StatCard
          icon={AlertTriangle}
          label="Low stock"
          value={stats.lowStockCount.toString()}
          warning={stats.lowStockCount > 0}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <section className="lg:col-span-2 bg-surface border border-border-soft rounded-2xl overflow-hidden">
          <header className="flex items-center justify-between px-5 py-4 border-b border-border-soft">
            <h2 className="font-display text-base font-semibold text-fg">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs font-medium text-primary hover:text-primary-hover inline-flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </header>
          {stats.recentOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-fg-2">No orders yet.</div>
          ) : (
            <ul className="divide-y divide-border-soft">
              {stats.recentOrders.map((order) => {
                const itemCount = order.subOrders.reduce(
                  (s, so) => s + so.items.reduce((x, i) => x + i.quantity, 0), 0
                );
                return (
                  <li key={order.id}>
                    <Link
                      href={`/admin/orders/${order.orderNumber}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-surface-1 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="font-mono text-[11px] text-fg-3">{order.orderNumber}</span>
                          <span className={cn(
                            'inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full',
                            STATUS_COLOR[order.status as keyof typeof STATUS_COLOR] || 'text-fg-2 bg-surface-2'
                          )}>
                            {STATUS_LABEL[order.status as keyof typeof STATUS_LABEL] || order.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-fg">
                          {itemCount} item{itemCount === 1 ? '' : 's'} · {formatCurrency(Number(order.total))}
                        </p>
                      </div>
                      <span className="text-xs text-fg-2 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Low stock */}
        <section className="bg-surface border border-border-soft rounded-2xl overflow-hidden">
          <header className="flex items-center justify-between px-5 py-4 border-b border-border-soft">
            <h2 className="font-display text-base font-semibold text-fg">Low stock</h2>
            <Link href="/admin/products" className="text-xs font-medium text-primary hover:text-primary-hover inline-flex items-center gap-1">
              All products <ArrowRight className="h-3 w-3" />
            </Link>
          </header>
          {stats.lowStockProducts.length === 0 ? (
            <div className="p-8 text-center text-sm text-fg-2">Stock looks good.</div>
          ) : (
            <ul className="divide-y divide-border-soft">
              {stats.lowStockProducts.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-surface-1 transition-colors"
                  >
                    <span className="flex-1 text-sm font-medium text-fg line-clamp-1">{p.name}</span>
                    <span className={cn(
                      'inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap',
                      p.stockQuantity === 0 ? 'text-danger bg-danger/10' : 'text-warning bg-warning/10'
                    )}>
                      {p.stockQuantity === 0 ? 'Out' : `${p.stockQuantity} left`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, warning = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className="bg-surface border border-border-soft rounded-2xl p-4 lg:p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-[0.15em] text-fg-2 font-medium">{label}</span>
        <Icon className={cn('h-4 w-4', warning ? 'text-warning' : 'text-fg-3')} />
      </div>
      <p className="font-display text-2xl lg:text-3xl font-semibold text-fg leading-none">{value}</p>
    </div>
  );
}