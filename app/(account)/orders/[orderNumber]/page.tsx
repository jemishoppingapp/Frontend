import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { MapPin, ChevronLeft, Check, Clock } from 'lucide-react';
import { Container } from '@/components/Container';
import { requireAuth } from '@/lib/session';
import { db, schema } from '@/db';
import { formatCurrency, cn } from '@/lib/utils';
import { DELIVERY_ZONES } from '@/lib/checkout';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Order Details', robots: { index: false } };

const STATUS_LABEL = {
  pending: 'Awaiting payment', confirmed: 'Confirmed', processing: 'Processing',
  ready_for_pickup: 'Ready for pickup', completed: 'Completed', cancelled: 'Cancelled',
};
const STATUS_COLOR = {
  pending: 'text-warning bg-warning/10',
  confirmed: 'text-primary bg-primary/10',
  processing: 'text-primary bg-primary/10',
  ready_for_pickup: 'text-primary bg-primary/10',
  completed: 'text-fg-2 bg-surface',
  cancelled: 'text-danger bg-danger/10',
};

export default async function OrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const user = await requireAuth();
  const { orderNumber } = await params;

  const rows = await db().select().from(schema.orders)
    .where(and(eq(schema.orders.orderNumber, orderNumber), eq(schema.orders.userId, user.id)))
    .limit(1);

  const order = rows[0];
  if (!order) notFound();

  const zoneName = DELIVERY_ZONES.find((z) => z.slug === order.deliveryZone)?.name ?? order.deliveryZone;
  const subtotal = Number(order.subtotal);
  const deliveryFee = Number(order.deliveryFee);
  const total = Number(order.total);
  const isPaid = order.paymentStatus === 'paid';

  return (
    <Container className="py-6 sm:py-10 max-w-3xl">
      <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-fg-2 hover:text-fg mb-5">
        <ChevronLeft className="h-4 w-4" /> All orders
      </Link>

      <div className="mb-7">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-fg">
            <span className="font-mono">{order.orderNumber}</span>
          </h1>
          <span className={cn(
            'inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full',
            STATUS_COLOR[order.status as keyof typeof STATUS_COLOR] || 'text-fg-2 bg-surface'
          )}>
            {STATUS_LABEL[order.status as keyof typeof STATUS_LABEL] || order.status}
          </span>
        </div>
        <p className="text-sm text-fg-2">
          Placed {new Date(order.createdAt).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
        </p>
      </div>

      {isPaid && order.subOrders.length > 0 && order.subOrders[0].pickupCode && (
        <div className="mb-6 rounded-3xl border border-primary-soft glass p-7 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-fg-2 mb-2 font-medium">Pickup code</p>
          <div className="font-mono font-bold tracking-[0.3em] text-primary text-4xl sm:text-5xl mb-3 leading-none">
            {order.subOrders[0].pickupCode}
          </div>
          <p className="text-xs text-fg-2">
            Show at <span className="font-semibold text-fg">{zoneName}</span> when collecting.
          </p>
        </div>
      )}

      <section className="bg-surface-1 border border-border-soft rounded-2xl mb-5">
        <div className="px-6 py-4 border-b border-border-soft">
          <h2 className="font-display text-base font-semibold text-fg">Items</h2>
        </div>
        <ul className="divide-y divide-border-soft">
          {order.subOrders.flatMap((so) =>
            so.items.map((item) => (
              <li key={`${so.subOrderNumber}-${item.productId}`} className="px-6 py-4 flex gap-3">
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.slug}`} className="text-sm font-medium text-fg hover:text-primary line-clamp-2">
                    {item.name}
                  </Link>
                  <p className="text-[11px] text-fg-3 mt-0.5">
                    {item.seller} · {formatCurrency(item.price)} each
                  </p>
                </div>
                <div className="text-right whitespace-nowrap">
                  <p className="text-sm text-fg-2">×{item.quantity}</p>
                  <p className="text-sm font-semibold text-fg">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="bg-surface-1 border border-border-soft rounded-2xl p-6 mb-5">
        <h2 className="font-display text-base font-semibold text-fg mb-4">Pickup details</h2>
        <div className="flex items-start gap-3 mb-3">
          <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-fg">{zoneName}</p>
            {order.deliveryDescription && <p className="text-xs text-fg-2 mt-0.5">{order.deliveryDescription}</p>}
          </div>
        </div>
        {order.customerNote && (
          <div className="text-xs text-fg-2 bg-surface rounded-md px-3 py-2 border border-border-soft">
            <span className="font-semibold text-fg-1">Note: </span>{order.customerNote}
          </div>
        )}
      </section>

      <section className="bg-surface-1 border border-border-soft rounded-2xl p-6 mb-5">
        <h2 className="font-display text-base font-semibold text-fg mb-4">Total</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-fg-2">Subtotal</dt><dd className="text-fg">{formatCurrency(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-fg-2">Delivery</dt><dd className="text-fg">{formatCurrency(deliveryFee)}</dd></div>
          <div className="flex justify-between pt-3 border-t border-border-soft">
            <dt className="font-display text-base font-semibold text-fg">Total</dt>
            <dd className="font-display text-base font-semibold text-fg">{formatCurrency(total)}</dd>
          </div>
        </dl>
      </section>

      {order.timeline.length > 0 && (
        <section className="bg-surface-1 border border-border-soft rounded-2xl p-6">
          <h2 className="font-display text-base font-semibold text-fg mb-4">Timeline</h2>
          <ol className="space-y-4">
            {order.timeline.map((entry, idx) => (
              <li key={idx} className="flex gap-3">
                <div className={cn(
                  'h-7 w-7 rounded-full flex items-center justify-center shrink-0',
                  idx === order.timeline.length - 1 ? 'bg-primary text-primary-foreground' : 'bg-surface text-fg-2 border border-border-soft'
                )}>
                  {idx === order.timeline.length - 1 ? <Check className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-fg capitalize">{entry.status.replace(/_/g, ' ')}</p>
                  {entry.note && <p className="text-xs text-fg-2 mt-0.5">{entry.note}</p>}
                  <p className="text-[11px] text-fg-3 mt-1">
                    {new Date(entry.timestamp).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
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