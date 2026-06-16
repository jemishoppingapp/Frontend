import { desc, eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { requireSeller } from '@/lib/seller-session';
import { ok, fail, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return withErrorHandling(async () => {
    let seller;
    try {
      const result = await requireSeller();
      seller = result.seller;
    } catch {
      return fail('FORBIDDEN', 'Seller access required.');
    }

    const rows = await db()
      .select({
        id: schema.payouts.id,
        amount: schema.payouts.amount,
        method: schema.payouts.method,
        status: schema.payouts.status,
        transferRef: schema.payouts.transferRef,
        note: schema.payouts.note,
        createdAt: schema.payouts.createdAt,
        completedAt: schema.payouts.completedAt,
      })
      .from(schema.payouts)
      .where(eq(schema.payouts.sellerId, seller.id))
      .orderBy(desc(schema.payouts.createdAt))
      .limit(50);

    return ok({ payouts: rows });
  });
}