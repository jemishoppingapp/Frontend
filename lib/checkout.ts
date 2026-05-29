/**
 * Transactional checkout primitives.
 *
 * Three operations live here:
 *
 *  createPendingOrder()
 *    /api/payment/initialize — validates cart against live products,
 *    locks stock with SELECT FOR UPDATE, inserts a pending Order row.
 *    Entire flow is wrapped in a transaction so concurrent buyers of
 *    the last unit serialize correctly.
 *
 *  markOrderPaid()
 *    /api/payment/verify and /api/payment/webhook — idempotently
 *    transitions an order to paid, generates pickup codes, decrements
 *    stock. SELECT FOR UPDATE on the order row serializes concurrent
 *    verify+webhook arrivals.
 *
 *  expireStaleOrders()
 *    Both the nightly Vercel Cron and the lazy /orders cleanup call
 *    this. Marks pending orders older than ORDER_TTL_MS as cancelled.
 *    Idempotent. Returns count of orders expired.
 *
 *  deletePendingOrderByReference()
 *    If /api/payment/initialize creates a pending order and then the
 *    Paystack init API call fails, we delete the orphaned order. Only
 *    deletes orders still in `pending` paymentStatus — safe to call
 *    even if the order has already been paid (no-op in that case).
 */
import { and, eq, lt, sql, inArray } from 'drizzle-orm';
import { dbPool } from '@/db/pool';
import { schema } from '@/db';
import { ApiServerError } from '@/lib/api';
import { generateOrderNumber, generatePickupCode } from '@/lib/utils';

const DELIVERY_FEE = 500;
export const ORDER_TTL_MS = 60 * 60 * 1000; // 1 hour

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
 * Creates a pending order transactionally:
 *   1. SELECT FOR UPDATE the product rows referenced in cart
 *   2. Verify each row is active, in stock, has enough quantity
 *   3. Recompute prices server-side (don't trust client)
 *   4. INSERT the order
 *
 * Throws ApiServerError with human-readable messages. Caller wraps in
 * withErrorHandling so they reach the user as proper API responses.
 */
export async function createPendingOrder(
  input: CheckoutInput
): Promise<CreatePendingOrderResult> {
  if (input.items.length === 0) {
    throw new ApiServerError('CART_EMPTY', "Your cart is empty.");
  }

  const productIds = input.items.map((i) => i.productId);
  const orderNumber = generateOrderNumber();
  const reference = `${orderNumber}-${Date.now().toString(36).toUpperCase()}`;

  return await dbPool().transaction(async (tx) => {
    // SELECT FOR UPDATE locks the rows so other transactions buying the
    // same items wait until we COMMIT. Without this, two simultaneous
    // checkouts can both pass the in-stock check on the last unit.
    const lockedRows = await tx.execute(
      sql`SELECT id, name, slug, description, price, original_price,
                 images, category, in_stock, stock_quantity, seller, is_active
          FROM products
          WHERE id = ANY(${productIds}::uuid[])
            AND is_active = true
          FOR UPDATE`
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = lockedRows.rows as any[];
    const byId = new Map(products.map((p) => [p.id, p]));

    const orderItems: Array<{
      productId: string;
      name: string;
      slug: string;
      imageUrl: string;
      price: number;
      quantity: number;
      seller: string;
    }> = [];
    let subtotal = 0;

    for (const cartItem of input.items) {
      const p = byId.get(cartItem.productId);
      if (!p) {
        throw new ApiServerError(
          'PRODUCT_NOT_FOUND',
          'One of the items in your cart is no longer available. Please refresh.',
          'items'
        );
      }
      if (!p.in_stock || Number(p.stock_quantity) < cartItem.quantity) {
        const have = Number(p.stock_quantity);
        throw new ApiServerError(
          'INSUFFICIENT_STOCK',
          have === 0
            ? `"${p.name}" is out of stock.`
            : `Only ${have} of "${p.name}" left — please reduce the quantity.`,
          'items'
        );
      }
      const price = Number(p.price);
      orderItems.push({
        productId: p.id,
        name: p.name,
        slug: p.slug,
        imageUrl: Array.isArray(p.images) && p.images[0]?.url ? p.images[0].url : '',
        price,
        quantity: cartItem.quantity,
        seller: p.seller,
      });
      subtotal += price * cartItem.quantity;
    }

    const total = subtotal + DELIVERY_FEE;

    const subOrders = [
      {
        subOrderNumber: `${orderNumber}-1`,
        sellerName: 'JEMI Store',
        items: orderItems,
        subtotal,
        status: 'pending' as const,
        pickupCode: '',
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

    await tx.insert(schema.orders).values({
      userId: input.userId,
      orderNumber,
      subOrders,
      subtotal: String(subtotal),
      deliveryFee: String(DELIVERY_FEE),
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

    const newOrderRows = await tx
      .select({ id: schema.orders.id })
      .from(schema.orders)
      .where(eq(schema.orders.paystackReference, reference))
      .limit(1);

    if (!newOrderRows[0]) {
      throw new ApiServerError(
        'SERVER_ERROR',
        'Could not save your order. Please try again.'
      );
    }

    return {
      orderId: newOrderRows[0].id,
      orderNumber,
      reference,
      total,
    };
  });
}

/**
 * Mark an order paid. Idempotent. Decrements stock atomically.
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
    const lockedRows = await tx.execute(
      sql`SELECT id, order_number, payment_status, sub_orders, delivery_zone, total
          FROM orders
          WHERE paystack_reference = ${reference}
          FOR UPDATE`
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lockedRow = lockedRows.rows[0] as any;

    if (!lockedRow) {
      return { alreadyPaid: false, order: null };
    }

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedSubOrders = lockedRow.sub_orders.map((so: any) => ({
      ...so,
      status: 'confirmed' as const,
      pickupCode: generatePickupCode(),
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

/**
 * Marks pending orders older than ORDER_TTL_MS as cancelled.
 * Idempotent. Returns the number of orders expired.
 * Called by:
 *   - GET /api/cron/cleanup-orders (Vercel Cron, nightly)
 *   - The /orders server component (lazy cleanup, on every visit)
 *
 * We only touch orders whose paymentStatus is still 'pending' — never
 * touches orders that paid. Even if cron and lazy cleanup race on the
 * same order, both are no-ops if the other already cancelled it.
 */
export async function expireStaleOrders(): Promise<number> {
  const cutoff = new Date(Date.now() - ORDER_TTL_MS);
  const cutoffTimeline = JSON.stringify([
    {
      status: 'cancelled',
      timestamp: new Date().toISOString(),
      note: 'Order expired (payment not completed within 1 hour)',
    },
  ]);

  // Use the regular DB client (HTTP) — no transactions needed, this is
  // a single UPDATE statement.
  const result = await dbPool().execute(
    sql`UPDATE orders
        SET status = 'cancelled',
            payment_status = 'failed',
            timeline = timeline || ${cutoffTimeline}::jsonb,
            updated_at = now()
        WHERE payment_status = 'pending'
          AND status = 'pending'
          AND created_at < ${cutoff.toISOString()}`
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (result as any).rowCount ?? 0;
}

/**
 * Delete a pending order by Paystack reference. Used by
 * /api/payment/initialize if the Paystack init API call fails AFTER
 * we created the order row — we don't want orphaned pending orders.
 * Only deletes if still in 'pending' paymentStatus.
 */
export async function deletePendingOrderByReference(reference: string): Promise<void> {
  await dbPool().execute(
    sql`DELETE FROM orders
        WHERE paystack_reference = ${reference}
          AND payment_status = 'pending'`
  );
}

function lookupZoneName(slug: string): string {
  return DELIVERY_ZONES.find((z) => z.slug === slug)?.name ?? slug;
}