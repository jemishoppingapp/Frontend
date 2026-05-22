import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import {
  MapPin,
  Package,
  ChevronLeft,
  Check,
  Clock,
} from 'lucide-react';
import { Container } from '@/components/Container';
import { Badge } from '@/components/ui/badge';
import { requireAuth } from '@/lib/session';
import { db, schema } from '@/db';
import { formatCurrency, cn } from '@/lib/utils';
import { DELIVERY_ZONES } from '@/lib/checkout';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Order Details',
  robots: { index: false },
};

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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const user = await requireAuth();
  const { orderNumber } = await params;

  const rows = await db()
    .select()
    .from(schema.orders)
    .where(
      and(eq(schema.orders.orderNumber, orderNumber), eq(schema.orders.userId, user.id))
    )
    .limit(1);

  const order = rows[0];
  if (!order) {
    notFound();
  }

  const zoneName =
    DELIVERY_ZONES.find((z) => z.slug === order.deliveryZone)?.name ?? order.deliveryZone;
  const subtotal = Number(order.subtotal);
  const deliveryFee = Number(order.deliveryFee);
  const total = Number(order.total);
  const isPaid = order.paymentStatus === 'paid';

  return (
    <Container className="py-6 sm:py-10 max-w-3xl">
      {/* Back link */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        All orders
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            <span className="font-mono">{order.orderNumber}</span>
          </h1>
          {statusBadge(order.status)}
        </div>
        <p className="text-sm text-gray-500">
          Placed{' '}
          {new Date(order.createdAt).toLocaleString('en-NG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* Pickup code — only show if paid */}
      {isPaid && order.subOrders.length > 0 && order.subOrders[0].pickupCode && (
        <div className="mb-6 rounded-2xl border border-primary-light bg-primary-light/40 p-5 text-center">
          <p className="text-[11px] uppercase tracking-wider text-gray-600 mb-1 font-medium">
            Pickup code
          </p>
          <div className="text-3xl sm:text-4xl font-bold tracking-[0.25em] text-primary-dark font-mono mb-2">
            {order.subOrders[0].pickupCode}
          </div>
          <p className="text-xs text-gray-600">
            Show this code at <span className="font-semibold">{zoneName}</span> when collecting.
          </p>
        </div>
      )}

      {/* Items */}
      <section className="border border-border-soft rounded-lg bg-white mb-5">
        <div className="px-5 py-4 border-b border-border-soft">
          <h2 className="text-base font-semibold text-gray-900">Items</h2>
        </div>
        <ul className="divide-y divide-border-soft">
          {order.subOrders.flatMap((so) =>
            so.items.map((item) => (
              <li key={`${so.subOrderNumber}-${item.productId}`} className="px-5 py-3 flex gap-3">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.slug}`}
                    className="text-sm font-medium text-gray-900 hover:text-primary line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.seller} · {formatCurrency(item.price)} each
                  </p>
                </div>
                <div className="text-right whitespace-nowrap">
                  <p className="text-sm text-gray-700">×{item.quantity}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      {/* Pickup details */}
      <section className="border border-border-soft rounded-lg bg-white p-5 mb-5">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Pickup details</h2>
        <div className="flex items-start gap-3 mb-3">
          <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-gray-900">{zoneName}</p>
            {order.deliveryDescription && (
              <p className="text-xs text-gray-600 mt-0.5">{order.deliveryDescription}</p>
            )}
          </div>
        </div>
        {order.customerNote && (
          <div className="text-xs text-gray-600 bg-surface-muted rounded-md px-3 py-2">
            <span className="font-semibold text-gray-700">Note: </span>
            {order.customerNote}
          </div>
        )}
      </section>

      {/* Totals */}
      <section className="border border-border-soft rounded-lg bg-white p-5 mb-5">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Total</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Subtotal</dt>
            <dd className="text-gray-900">{formatCurrency(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Delivery</dt>
            <dd className="text-gray-900">{formatCurrency(deliveryFee)}</dd>
          </div>
          <div className="flex justify-between pt-3 border-t border-border-soft">
            <dt className="text-base font-bold text-gray-900">Total</dt>
            <dd className="text-base font-bold text-gray-900">{formatCurrency(total)}</dd>
          </div>
        </dl>
      </section>

      {/* Timeline */}
      {order.timeline.length > 0 && (
        <section className="border border-border-soft rounded-lg bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Timeline</h2>
          <ol className="space-y-3">
            {order.timeline.map((entry, idx) => (
              <li key={idx} className="flex gap-3">
                <div
                  className={cn(
                    'h-7 w-7 rounded-full flex items-center justify-center shrink-0',
                    idx === order.timeline.length - 1
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-surface-muted text-gray-500'
                  )}
                >
                  {idx === order.timeline.length - 1 ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {entry.status.replace(/_/g, ' ')}
                  </p>
                  {entry.note && <p className="text-xs text-gray-500">{entry.note}</p>}
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {new Date(entry.timestamp).toLocaleString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </Container>
  );
}