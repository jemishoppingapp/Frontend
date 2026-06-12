import { sql } from 'drizzle-orm';
import { dbPool } from '@/db/pool';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { requireSeller } from '@/lib/seller-session';
import { ok, fail, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  return withErrorHandling(async () => {
    const { user, seller } = await requireSeller();
    const { orderNumber } = await params;

    return await dbPool().transaction(async (tx) => {
      // Lock the order row
      const lockedRows = await tx.execute(sql`
        SELECT id, status, payment_status, sub_orders, seller_delivery_marks
        FROM orders
        WHERE order_number = ${orderNumber}
        FOR UPDATE
      `);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row = lockedRows.rows[0] as any;

      if (!row) {
        return fail('ORDER_NOT_FOUND', 'Order not found.');
      }

      if (row.payment_status !== 'paid') {
        return fail('VALIDATION_ERROR', 'Cannot mark delivered until payment is confirmed.');
      }

      if (row.status !== 'ready_for_pickup') {
        return fail(
          'VALIDATION_ERROR',
          'Order must be in "Ready for pickup" status before you can mark it delivered.'
        );
      }

      // Verify ownership — at least one item in this order belongs to this seller
      const sellerProducts = await tx
        .select({ id: schema.products.id })
        .from(schema.products)
        .where(eq(schema.products.sellerId, seller.id));
      const productIds = new Set(sellerProducts.map((p) => p.id));

      let hasItems = false;
      for (const so of row.sub_orders ?? []) {
        for (const item of so.items ?? []) {
          if (productIds.has(item.productId)) {
            hasItems = true;
            break;
          }
        }
        if (hasItems) break;
      }

      if (!hasItems) {
        return fail('FORBIDDEN', 'You have no items in this order.');
      }

      // Check if already marked
      const existingMarks = row.seller_delivery_marks ?? {};
      if (existingMarks[seller.id]) {
        return fail('VALIDATION_ERROR', 'You have already marked this order as delivered.');
      }

      // Add the mark
      const newMark = {
        deliveredAt: new Date().toISOString(),
        deliveredBy: user.id,
      };

      await tx.execute(sql`
        UPDATE orders
        SET seller_delivery_marks = COALESCE(seller_delivery_marks, '{}'::jsonb)
                                    || ${JSON.stringify({ [seller.id]: newMark })}::jsonb,
            updated_at = now()
        WHERE id = ${row.id}
      `);

      return ok({ marked: true, at: newMark.deliveredAt });
    });
  });
}