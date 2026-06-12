import { eq, sql } from 'drizzle-orm';
import { db, schema } from '@/db';
import { requireSeller } from '@/lib/seller-session';
import { SellerSidebar } from '@/components/seller/SellerSidebar';

export const dynamic = 'force-dynamic';

export default async function SellerAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, seller } = await requireSeller();

  // Pending orders count for sidebar badge: orders containing this seller's
  // products in a status the seller still needs to act on.
  let pendingOrdersCount = 0;
  try {
    // Find product IDs owned by this seller
    const sellerProducts = await db()
      .select({ id: schema.products.id })
      .from(schema.products)
      .where(eq(schema.products.sellerId, seller.id));
    const productIds = sellerProducts.map((p) => p.id);

    if (productIds.length > 0) {
      const countRows = await db().execute(sql`
        SELECT COUNT(DISTINCT id)::int AS n FROM orders
        WHERE status IN ('confirmed', 'processing', 'ready_for_pickup')
          AND payment_status = 'paid'
          AND EXISTS (
            SELECT 1
            FROM jsonb_array_elements(sub_orders) AS so,
                 jsonb_array_elements(so->'items') AS item
            WHERE (item->>'productId')::uuid = ANY (${productIds}::uuid[])
          )
      `);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pendingOrdersCount = (countRows.rows[0] as any)?.n ?? 0;
    }
  } catch {
    // If query fails, layout still renders without badge.
  }

  return (
    <div className="seller-shell min-h-screen flex flex-col lg:flex-row bg-surface-1">
      <SellerSidebar
        sellerName={user.name}
        sellerEmail={user.email}
        businessName={seller.businessName}
        pendingOrdersCount={pendingOrdersCount}
      />
      <main className="flex-1 min-w-0 page-fade">{children}</main>
    </div>
  );
}