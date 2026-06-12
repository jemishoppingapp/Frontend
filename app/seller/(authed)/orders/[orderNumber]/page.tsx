import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { ChevronLeft, MapPin, User, Package as PackageIcon } from 'lucide-react';
import { db, schema } from '@/db';
import { requireSeller } from '@/lib/seller-session';
import { formatCurrency, cn } from '@/lib/utils';
import { DELIVERY_ZONES } from '@/lib/checkout';
import { SellerOrderActions } from './SellerOrderActions';

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

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  seller?: string;
}

export default async function SellerOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { seller } = await requireSeller();
  const { orderNumber } = await params;

  // Fetch the order with buyer info
  const orderRows = await db()
    .select({ order: schema.orders, user: schema.users })
    .from(schema.orders)
    .leftJoin(schema.users, eq(schema.orders.userId, schema.users.id))
    .where(eq(schema.orders.orderNumber, orderNumber))
    .limit(1);
  const orderRow = orderRows[0];
  if (!orderRow || !orderRow.user) notFound();

  const { order, user } = orderRow;

  // Get seller's product IDs to filter items
  const sellerProducts = await db()
    .select({ id: schema.products.id })
    .from(schema.products)
    .where(eq(schema.products.sellerId, seller.id));
  const productIds = new Set(sellerProducts.map((p) => p.id));

  // Filter sub_orders → items where productId is in this seller's set
  const sellerItems: OrderItem[] = [];
  for (const so of order.subOrders) {
    for (const item of so.items) {
      if (productIds.has(item.productId)) {
        sellerItems.push(item);
      }
    }
  }

  // Ownership check — seller must have at least one item in this order
  if (sellerItems.length === 0) {
    notFound();
  }

  const sellerSubtotal = sellerItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const platformFee = sellerSubtotal * (Number(seller.platformFeePercent) / 100);
  const sellerPayable = sellerSubtotal - platformFee;
  const itemCount = sellerItems.reduce((s, i) => s + i.quantity, 0);

  const zoneName = DELIVERY_ZONES.find((z) => z.slug === order.deliveryZone)?.name ?? order.deliveryZone;
  const isPaid = order.paymentStatus === 'paid';
  const isReadyForPickup = order.status === 'ready_for_pickup';

  // Check if this seller has already marked delivered
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deliveryMarks: Record<string, { deliveredAt: string; deliveredBy: string }> = (order as any).sellerDeliveryMarks ?? {};
  const hasMarkedDelivered = !!deliveryMarks[seller.id];

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-4xl">
      <Link href="/seller/orders" className="inline-flex items-center gap-1 text-sm text-fg-2 hover:text-fg mb-5">
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
            {hasMarkedDelivered && (
              <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full text-success bg-success/10">
                You marked delivered
              </span>
            )}
          </div>
          <p className="text-sm text-fg-2">
            Placed{' '}
            {new Date(order.createdAt).toLocaleString('en-NG', {
              day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Actions (Mark Delivered + Print Slip) */}
      <SellerOrderActions
        orderNumber={order.orderNumber}
        canMarkDelivered={isPaid && isReadyForPickup && !hasMarkedDelivered}
        hasMarkedDelivered={hasMarkedDelivered}
        status={order.status}
      />

      {/* Pickup code */}
      {isPaid && (
        <div className="mt-6 rounded-2xl border-2 border-primary-soft bg-primary-soft/40 p-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-fg-2 mb-2 font-medium">Pickup code</p>
          <div className="font-mono font-bold tracking-[0.3em] text-primary text-3xl sm:text-4xl mb-2 leading-none">
            {order.subOrders[0]?.pickupCode ?? '----'}
          </div>
          <p className="text-xs text-fg-2">
            Buyer must show this code. Verify it matches before handing over items.
          </p>
        </div>
      )}

      {/* Buyer (name only, no phone per design) */}
      <section className="mt-6 bg-surface border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-4 inline-flex items-center gap-2">
          <User className="h-4 w-4 text-fg-2" /> Buyer
        </h2>
        <dl className="text-sm">
          <div><dt className="text-fg-2 text-xs mb-0.5">Name</dt><dd className="text-fg font-medium">{user.name}</dd></div>
        </dl>
        <p className="text-[11px] text-fg-3 mt-3 leading-relaxed">
          Need to reach the buyer? Contact JEMI admin — direct buyer communication is routed through us.
        </p>
      </section>

      {/* Your items only */}
      <section className="mt-5 bg-surface border border-border-soft rounded-2xl overflow-hidden">
        <header className="px-6 py-4 border-b border-border-soft flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-fg inline-flex items-center gap-2">
            <PackageIcon className="h-4 w-4 text-fg-2" />
            Your items
          </h2>
          <span className="text-xs text-fg-2">{itemCount} total</span>
        </header>
        <ul className="divide-y divide-border-soft">
          {sellerItems.map((item) => (
            <li key={item.productId} className="px-6 py-4 flex gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-fg line-clamp-2">{item.name}</p>
                <p className="text-[11px] text-fg-3 mt-0.5">
                  {formatCurrency(item.price)} each
                </p>
              </div>
              <div className="text-right whitespace-nowrap">
                <p className="text-sm text-fg-2">×{item.quantity}</p>
                <p className="text-sm font-semibold text-fg">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid lg:grid-cols-2 gap-4 mt-5">
        {/* Pickup */}
        <section className="bg-surface border border-border-soft rounded-2xl p-6">
          <h2 className="font-display text-base font-semibold text-fg mb-4 inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-fg-2" /> Pickup
          </h2>
          <p className="text-sm font-semibold text-fg">{zoneName}</p>
          {order.deliveryDescription && <p className="text-sm text-fg-2 mt-1">{order.deliveryDescription}</p>}
        </section>

        {/* Your earnings */}
        <section className="bg-surface border border-border-soft rounded-2xl p-6">
          <h2 className="font-display text-base font-semibold text-fg mb-4">Your earnings</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-fg-2">Your subtotal</dt>
              <dd className="text-fg">{formatCurrency(sellerSubtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-2">Platform fee ({seller.platformFeePercent}%)</dt>
              <dd className="text-fg-2">-{formatCurrency(platformFee)}</dd>
            </div>
            <div className="flex justify-between pt-3 border-t border-border-soft">
              <dt className="font-display text-base font-semibold text-fg">You earn</dt>
              <dd className="font-display text-base font-semibold text-fg">{formatCurrency(sellerPayable)}</dd>
            </div>
          </dl>
          <p className="text-[11px] text-fg-3 mt-3 leading-relaxed">
            Released to your payable balance once both you and the buyer confirm at pickup.
          </p>
        </section>
      </div>
    </div>
  );
}