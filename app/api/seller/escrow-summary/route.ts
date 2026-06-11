import { requireSeller } from '@/lib/seller-session';
import { getSellerEscrowSummary } from '@/lib/escrow-server';
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

    const summary = await getSellerEscrowSummary(seller.id);
    return ok(summary);
  });
}