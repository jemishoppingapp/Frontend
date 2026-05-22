import type { Metadata } from 'next';
import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { ChevronRight, Package } from 'lucide-react';
import { Container } from '@/components/Container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { requireAuth } from '@/lib/session';
import { db, schema } from '@/db';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'My Orders',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

const STATUS_VARIANTS = {
  pending: { variant: 'warning' as const, label: 'Awaiting payment' },
  confirmed: { variant: 'default' as const, label: 'Confirmed' },
  processing: { variant: 'default' as const, label: 'Processing' },
  ready_for_pickup: { variant: 'success' as const, label: 'Ready for pickup' },
  completed: { variant: 'success' as const, label: 'Completed' },
  cancelled: { variant: 'danger' as const, label: 'Cancelled' },
};

function statusBadge(status: string) {
  const cfg = STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS];
  if (!cfg) return <Badge variant="secondary">{status}</Badge>;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

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
      <Container className="py-12 sm:py-16 text-center max-w-2xl">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-surface-muted mb-4">
          <Package className="h-7 w-7 text-gray-400" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h1>
        <p className="text-sm text-gray-500 mb-6">
          When you place your first order, it'll show up here.
        </p>
        <Button asChild variant="default" size="tap">
          <Link href="/products">Start shopping</Link>
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-6 sm:py-10 max-w-3xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
      <p className="text-sm text-gray-500 mb-6">
        {orders.length} order{orders.length === 1 ? '' : 's'}
      </p>

      <ul className="space-y-3">
        {orders.map((order) => {
          const itemCount = order.subOrders.reduce(
            (sum, so) => sum + so.items.reduce((s, i) => s + i.quantity, 0),
            0
          );
          return (
            <li key={order.id}>
              <Link
                href={`/orders/${order.orderNumber}`}
                className="block border border-border-soft rounded-lg bg-white p-4 sm:p-5 hover:shadow-md hover:border-border transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs text-gray-500">
                        {order.orderNumber}
                      </span>
                      {statusBadge(order.status)}
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {itemCount} item{itemCount === 1 ? '' : 's'} ·{' '}
                      {formatCurrency(Number(order.total))}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 mt-1" aria-hidden />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Container>
  );
}