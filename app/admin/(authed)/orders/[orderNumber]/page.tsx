import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { ChevronLeft, MapPin, User, Check, Clock } from 'lucide-react';
import { db, schema } from '@/db';
import { formatCurrency, cn } from '@/lib/utils';
import { DELIVERY_ZONES } from '@/lib/checkout';
import { AdminOrderStatusActions } from './AdminOrderStatusActions';
import { AdminRefundButton } from './AdminRefundButton';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Order Detail', robots: { index: false } };

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

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  const rows = await db()
    .select({
      order: schema.orders,
      user: schema.users,
    })
    .from(schema.orders)
    .leftJoin(schema.users, eq(schema.orders.userId, schema.users.id))
    .where(eq(schema.orders.orderNumber, orderNumber))
    .limit(1);

  const row = rows[0];
  if (!row) notFound();

  const { order, user } = row;
  const zoneName = DELIVERY_ZONES.find((z) => z.slug === order.deliveryZone)?.name ?? order.deliveryZone;
  const subtotal = Number(order.subtotal);
  const deliveryFee = Number(order.deliveryFee);
  const total = Number(order.total);
  const isPaid = order.paymentStatus === 'paid';

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-5xl">
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-fg-2 hover:text-fg mb-5">
        <ChevronLeft className="h-4 w-4" /> All orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-7">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-fg">
              <span className="font-mono">{order.orderNumber}</span>
            </h1>
            <span className={cn(
              'inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full',
              STATUS_COLOR[order.status] || 'text-fg-2 bg-surface-2'
            )}>
              {STATUS_LABEL[order.status] || order.status}
            </span>
          </div>
          <p className="text-sm text-fg-2">
            Placed{' '}
            {new Date(order.createdAt).toLocaleString('en-NG', {
              day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Status update actions */}
      <AdminOrderStatusActions
        orderNumber={order.orderNumber}
        status={order.status}
        paymentStatus={order.paymentStatus}
      />

      {/* Pickup code */}
      {isPaid && order.subOrders.length > 0 && order.subOrders[0].pickupCode && (
        <div className="mt-6 rounded-2xl border-2 border-primary-soft bg-primary-soft/30 p-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-fg-2 mb-2 font-medium">Pickup code</p>
          <div className="font-mono font-bold tracking-[0.3em] text-primary text-3xl sm:text-4xl mb-2 leading-none">
            {order.subOrders[0].pickupCode}
          </div>
          <p className="text-xs text-fg-2">Verify this matches what the buyer shows at pickup.</p>
        </div>
      )}

      {/* Buyer details */}
      {user && (
        <section className="mt-6 bg-surface border border-border-soft rounded-2xl p-6">
          <h2 className="font-display text-base font-semibold text-fg mb-4 inline-flex items-center gap-2">
            <User className="h-4 w-4 text-fg-2" /> Buyer
          </h2>
          <dl className="grid sm:grid-cols-2 gap-3 text-sm">
            <div><dt className="text-fg-2 text-xs mb-0.5">Name</dt><dd className="text-fg">{user.name}</dd></div>
            <div><dt className="text-fg-2 text-xs mb-0.5">Email</dt><dd className="text-fg">{user.email}</dd></div>
            <div><dt className="text-fg-2 text-xs mb-0.5">Phone</dt><dd className="text-fg">{user.phone || '—'}</dd></div>
            {user.altPhone && (<div><dt className="text-fg-2 text-xs mb-0.5">Alt phone</dt><dd className="text-fg">{user.altPhone}</dd></div>)}
            <div className="sm:col-span-2"><dt className="text-fg-2 text-xs mb-0.5">Address</dt><dd className="text-fg">{user.address || '—'}</dd></div>
            <div><dt className="text-fg-2 text-xs mb-0.5">Department</dt><dd className="text-fg">{user.department || '—'}</dd></div>
            <div><dt className="text-fg-2 text-xs mb-0.5">Level</dt><dd className="text-fg">{user.level || '—'}</dd></div>
          </dl>
        </section>
      )}

      {/* Items */}
      <section className="mt-6 bg-surface border border-border-soft rounded-2xl overflow-hidden">
        <header className="px-6 py-4 border-b border-border-soft">
          <h2 className="font-display text-base font-semibold text-fg">Items</h2>
        </header>
        <ul className="divide-y divide-border-soft">
          {order.subOrders.flatMap((so) =>
            so.items.map((item) => (
              <li key={`${so.subOrderNumber}-${item.productId}`} className="px-6 py-4 flex gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-fg line-clamp-2">{item.name}</p>
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

      {/* Pickup + total */}
      <div className="grid lg:grid-cols-2 gap-4 mt-6">
        <section className="bg-surface border border-border-soft rounded-2xl p-6">
          <h2 className="font-display text-base font-semibold text-fg mb-4 inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-fg-2" /> Pickup
          </h2>
          <p className="text-sm font-semibold text-fg">{zoneName}</p>
          {order.deliveryDescription && <p className="text-sm text-fg-2 mt-1">{order.deliveryDescription}</p>}
          {order.customerNote && (
            <div className="mt-3 text-xs text-fg-2 bg-surface-1 rounded-md px-3 py-2 border border-border-soft">
              <span className="font-semibold text-fg-1">Buyer note: </span>{order.customerNote}
            </div>
          )}
        </section>

        <section className="bg-surface border border-border-soft rounded-2xl p-6">
          <h2 className="font-display text-base font-semibold text-fg mb-4">Total</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-fg-2">Subtotal</dt><dd className="text-fg">{formatCurrency(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-fg-2">Delivery</dt><dd className="text-fg">{formatCurrency(deliveryFee)}</dd></div>
            <div className="flex justify-between pt-3 border-t border-border-soft">
              <dt className="font-display text-base font-semibold text-fg">Total</dt>
              <dd className="font-display text-base font-semibold text-fg">{formatCurrency(total)}</dd>
            </div>
          </dl>
          <div className="mt-3 pt-3 border-t border-border-soft text-xs text-fg-2">
            Payment status:{' '}
            <span className={cn(
              'font-medium',
              order.paymentStatus === 'paid' ? 'text-success' :
              order.paymentStatus === 'failed' ? 'text-danger' : 'text-warning'
            )}>
              {order.paymentStatus}
            </span>
          </div>
        </section>
      </div>

      {/* Timeline */}
      {order.timeline.length > 0 && (
        <section className="mt-6 bg-surface border border-border-soft rounded-2xl p-6">
          <h2 className="font-display text-base font-semibold text-fg mb-4">Timeline</h2>
          <ol className="space-y-4">
            {order.timeline.map((entry, idx) => (
              <li key={idx} className="flex gap-3">
                <div className={cn(
                  'h-7 w-7 rounded-full flex items-center justify-center shrink-0',
                  idx === order.timeline.length - 1 ? 'bg-primary text-primary-foreground' : 'bg-surface-1 text-fg-2 border border-border-soft'
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
    
      <div className="mt-6">
        <AdminRefundButton
          orderNumber={order.orderNumber}
          canRefund={order.paymentStatus === 'paid' && order.escrowStatus !== 'refunded'}
          alreadyRefunded={order.escrowStatus === 'refunded'}
        />
      </div>
</div>
  );
}