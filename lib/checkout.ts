/**
 * Transactional checkout primitives.
 *
 * Two operations live here:
 *   - createPendingOrder(): called by /api/payment/initialize.
 *     Validates cart items against live products, computes the canonical
 *     total server-side (never trust client prices), inserts a pending
 *     Order row, returns the order + reference for Paystack init.
 *
 *   - markOrderPaid(): called by BOTH /api/payment/verify and
 *     /api/payment/webhook. Idempotent: uses SELECT FOR UPDATE to
 *     serialize concurrent updates, no-ops if the order is already paid.
 *     Decrements product stock atomically.
 *
 * Both run inside Postgres transactions via the WebSocket-pool client
 * (the neon-http client doesn't support transactions).
 */
import { eq, sql, and, inArray } from 'drizzle-orm';
import { dbPool } from '@/db/pool';
import { schema } from '@/db';
import { generateOrderNumber, generatePickupCode } from '@/lib/utils';

const DELIVERY_FEE = 500;  // ₦500 flat — both zones

export const DELIVERY_ZONES = [
  { slug: 'lasu-iba-gate', name: 'LASU Iba Gate', description: 'Main entrance' },
  { slug: 'iyana-iba-gate', name: 'Iyana Iba Gate', description: 'Iyana Iba bus stop' },
] as const;

export type DeliveryZoneSlug = (typeof DELIVERY_ZONES)[number]['slug'];

export interface CheckoutCartItem {
  productId: string;
  quantity: number;
}

export interface CheckoutInput {
  userId: string;
  userEmail: string;
  items: CheckoutCartItem[];
  deliveryZone: DeliveryZoneSlug;
  deliveryDescription: string;
  customerNote: string;
}

export interface CreatePendingOrderResult {
  orderId: string;
  orderNumber: string;
  reference: string;
  total: number;
}

/**
 * Validate cart against DB, build a pending order, return the unique
 * Paystack reference. Does NOT call Paystack — caller is responsible
 * for that.
 *
 * Throws if:
 *   - Any productId is invalid / inactive
 *   - Any item is out of stock
 *   - Cart is empty
 */
export async function createPendingOrder(
  input: CheckoutInput
): Promise<CreatePendingOrderResult> {
  if (input.items.length === 0) {
    throw new Error('Cart is empty');
  }

  // Look up every cart product server-side. We never trust client prices.
  const productIds = input.items.map((i) => i.productId);
  const products = await dbPool()
    .select()
    .from(schema.products)
    .where(
      and(inArray(schema.products.id, productIds), eq(schema.products.isActive, true))
    );

  // Build a map for O(1) lookup
  const byId = new Map(products.map((p) => [p.id, p]));

  // Validate each cart line, build order items
  const orderItems: {
    productId: string;
    name: string;
    slug: string;
    imageUrl: string;
    price: number;
    quantity: number;
    seller: string;
  }[] = [];
  let subtotal = 0;

  for (const cartItem of input.items) {
    const p = byId.get(cartItem.productId);
    if (!p) {
      throw new Error(`Product not found or inactive: ${cartItem.productId}`);
    }
    if (!p.inStock || p.stockQuantity < cartItem.quantity) {
      throw new Error(`Insufficient stock for ${p.name}`);
    }
    const price = Number(p.price);
    orderItems.push({
      productId: p.id,
      name: p.name,
      slug: p.slug,
      imageUrl: p.images?.[0]?.url ?? '',
      price,
      quantity: cartItem.quantity,
      seller: p.seller,
    });
    subtotal += price * cartItem.quantity;
  }

  const deliveryFee = DELIVERY_FEE;
  const total = subtotal + deliveryFee;
  const orderNumber = generateOrderNumber();
  // Paystack reference: prefix + UUID-ish suffix. The order_number is
  // human-readable for support; reference is what Paystack uses.
  const reference = `${orderNumber}-${Date.now().toString(36).toUpperCase()}`;

  // Single sub-order in v1 (all items are JEMI Store). When multi-vendor
  // ships, group by seller into multiple sub-orders here.
  const subOrders = [
    {
      subOrderNumber: `${orderNumber}-1`,
      sellerName: 'JEMI Store',
      items: orderItems,
      subtotal,
      status: 'pending' as const,
      pickupCode: '', // generated when payment confirms, not now
      pickupCodeUsed: false,
    },
  ];

  const timeline = [
    {
      status: 'pending',
      timestamp: new Date().toISOString(),
      note: 'Order created, awaiting payment',
    },
  ];

  // Insert the pending order. NO stock decrement here — that happens on
  // payment confirmation. If the user abandons checkout, the row just
  // sits there harmlessly.
  await dbPool()
    .insert(schema.orders)
    .values({
      userId: input.userId,
      orderNumber,
      subOrders,
      subtotal: String(subtotal),
      deliveryFee: String(deliveryFee),
      total: String(total),
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'paystack',
      paystackReference: reference,
      deliveryZone: input.deliveryZone,
      deliveryDescription: input.deliveryDescription,
      customerNote: input.customerNote,
      timeline,
    });

  const rows = await dbPool()
    .select({ id: schema.orders.id })
    .from(schema.orders)
    .where(eq(schema.orders.paystackReference, reference))
    .limit(1);

  if (!rows[0]) {
    throw new Error('Order insert succeeded but row lookup failed');
  }

  return {
    orderId: rows[0].id,
    orderNumber,
    reference,
    total,
  };
}

/**
 * Mark an order paid. Idempotent. Decrements product stock.
 *
 * Called by /api/payment/verify (after user redirects back from
 * Paystack) and /api/payment/webhook (Paystack server-to-server).
 * Whichever arrives first wins; the second one no-ops.
 *
 * Race safety: SELECT FOR UPDATE serializes concurrent calls on the
 * same order. Inside the transaction, we re-check paymentStatus before
 * doing anything mutating.
 */
export async function markOrderPaid(reference: string): Promise<{
  alreadyPaid: boolean;
  order: {
    id: string;
    orderNumber: string;
    pickupCode: string;
    pickupLocation: string;
    total: number;
    status: string;
  } | null;
}> {
  return await dbPool().transaction(async (tx) => {
    // Lock the order row to serialize concurrent verify+webhook calls.
    const lockedRows = await tx.execute(
      sql`SELECT id, order_number, payment_status, sub_orders, delivery_zone, total
          FROM orders
          WHERE paystack_reference = ${reference}
          FOR UPDATE`
    );
    const lockedRow = lockedRows.rows[0] as
      | {
          id: string;
          order_number: string;
          payment_status: string;
          sub_orders: Array<{
            subOrderNumber: string;
            sellerName: string;
            items: Array<{ productId: string; quantity: number }>;
            subtotal: number;
            status: string;
            pickupCode: string;
            pickupCodeUsed: boolean;
          }>;
          delivery_zone: string;
          total: string;
        }
      | undefined;

    if (!lockedRow) {
      return { alreadyPaid: false, order: null };
    }

    // Already paid? No-op — just return the existing state so /verify
    // can still render the success page.
    if (lockedRow.payment_status === 'paid') {
      const subOrder = lockedRow.sub_orders[0];
      return {
        alreadyPaid: true,
        order: {
          id: lockedRow.id,
          orderNumber: lockedRow.order_number,
          pickupCode: subOrder?.pickupCode ?? '',
          pickupLocation: lookupZoneName(lockedRow.delivery_zone),
          total: Number(lockedRow.total),
          status: 'paid',
        },
      };
    }

    // Generate pickup code(s) per sub-order
    const updatedSubOrders = lockedRow.sub_orders.map((so) => ({
      ...so,
      status: 'confirmed' as const,
      pickupCode: generatePickupCode(),
    }));

    // Build the SQL for decrementing stock atomically inside the same tx
    for (const subOrder of updatedSubOrders) {
      for (const item of subOrder.items) {
        await tx.execute(
          sql`UPDATE products
              SET stock_quantity = GREATEST(0, stock_quantity - ${item.quantity}),
                  in_stock = CASE WHEN stock_quantity - ${item.quantity} <= 0 THEN false ELSE in_stock END
              WHERE id = ${item.productId}`
        );
      }
    }

    // Mark the order paid + add a timeline entry
    await tx.execute(
      sql`UPDATE orders
          SET payment_status = 'paid',
              status = 'confirmed',
              sub_orders = ${JSON.stringify(updatedSubOrders)}::jsonb,
              timeline = timeline || ${JSON.stringify([
                {
                  status: 'paid',
                  timestamp: new Date().toISOString(),
                  note: 'Payment confirmed',
                },
              ])}::jsonb,
              updated_at = now()
          WHERE id = ${lockedRow.id}`
    );

    return {
      alreadyPaid: false,
      order: {
        id: lockedRow.id,
        orderNumber: lockedRow.order_number,
        pickupCode: updatedSubOrders[0]?.pickupCode ?? '',
        pickupLocation: lookupZoneName(lockedRow.delivery_zone),
        total: Number(lockedRow.total),
        status: 'paid',
      },
    };
  });
}

function lookupZoneName(slug: string): string {
  return DELIVERY_ZONES.find((z) => z.slug === slug)?.name ?? slug;
}