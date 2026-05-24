import type { Metadata } from 'next';
import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { ChevronRight, Package } from 'lucide-react';
import { Container } from '@/components/Container';
import { Button } from '@/components/ui/button';
import { requireAuth } from '@/lib/session';
import { db, schema } from '@/db';
import { formatCurrency, cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'My Orders', robots: { index: false } };
export const dynamic = 'force-dynamic';

const STATUS_LABEL = {
  pending: 'Awaiting payment',
  confirmed: 'Confirmed',
  processing: 'Processing',
  ready_for_pickup: 'Ready for pickup',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_COLOR = {
  pending: 'text-warning bg-warning/10',
  confirmed: 'text-primary bg-primary/10',
  processing: 'text-primary bg-primary/10',
  ready_for_pickup: 'text-primary bg-primary/10',
  completed: 'text-fg-2 bg-surface',
  cancelled: 'text-danger bg-danger/10',
};

export default async function OrdersPage() {
  const user = await requireAuth();
  const orders = await db()
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.userId, user.id))
    .orderBy(desc(schema.orders.createdAt))
    .limit(50);

  if (orders.length === 0) {
    return (
      <Container className="py-16 sm:py-24 text-center max-w-2xl">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-surface-1 mb-5">
          <Package className="h-7 w-7 text-fg-2" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-fg mb-2">No orders yet</h1>
        <p className="text-sm text-fg-2 mb-7">When you place your first order, it'll show up here.</p>
        <Button asChild variant="default" size="tap"><Link href="/products">Start shopping</Link></Button>
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-12 max-w-3xl">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-3">Orders</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-fg leading-tight">My orders</h1>
        <p className="text-sm text-fg-2 mt-2">{orders.length} order{orders.length === 1 ? '' : 's'}</p>
      </div>

      <ul className="space-y-3">
        {orders.map((order) => {
          const itemCount = order.subOrders.reduce((s, so) => s + so.items.reduce((x, i) => x + i.quantity, 0), 0);
          return (
            <li key={order.id}>
              <Link href={`/orders/${order.orderNumber}`}
                className="block bg-surface-1 hover:bg-surface-2 border border-border-soft rounded-2xl p-5 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-mono text-[11px] text-fg-3">{order.orderNumber}</span>
                      <span className={cn(
                        'inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full',
                        STATUS_COLOR[order.status as keyof typeof STATUS_COLOR] || 'text-fg-2 bg-surface'
                      )}>
                        {STATUS_LABEL[order.status as keyof typeof STATUS_LABEL] || order.status}
                      </span>
                    </div>
                    <p className="font-display text-base font-semibold text-fg">
                      {itemCount} item{itemCount === 1 ? '' : 's'} · {formatCurrency(Number(order.total))}
                    </p>
                    <p className="text-xs text-fg-2 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-fg-3 shrink-0 mt-1" aria-hidden />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Container>
  );
}