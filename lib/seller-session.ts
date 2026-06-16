import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { getCurrentUser, type CurrentUser } from '@/lib/session';

export interface SellerProfile {
  id: string;
  userId: string;
  businessName: string;
  businessTypeCategory: string;
  businessTypeNotes: string;
  businessAddress: string;
  businessPhone: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankCode: string;
  bankName: string;
  platformFeePercent: string;
  payoutCadence: 'weekly' | 'monthly';
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
}

/**
 * Loads the current user + their seller row.
 *
 * - Not signed in -> redirect /login
 * - Wrong role -> redirect /
 * - status != 'approved' -> redirect /sellers/pending
 *
 * Throws nothing; redirects on failure.
 */
export async function requireSeller(): Promise<{
  user: CurrentUser;
  seller: SellerProfile;
}> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  if (user.role === 'admin') {
    redirect('/admin');
  }
  if (user.role !== 'seller') {
    redirect('/');
  }

  const rows = await db()
    .select()
    .from(schema.sellers)
    .where(eq(schema.sellers.userId, user.id))
    .limit(1);

  const sellerRow = rows[0];
  if (!sellerRow) {
    // Edge case: user has seller role but no sellers row.
    // Shouldn't happen, but redirect to apply page so they can recover.
    redirect('/sellers/apply');
  }

  if (sellerRow.status !== 'approved') {
    redirect('/sellers/pending');
  }

  return {
    user,
    seller: {
      id: sellerRow.id,
      userId: sellerRow.userId,
      businessName: sellerRow.businessName,
      businessTypeCategory: sellerRow.businessTypeCategory,
      businessTypeNotes: sellerRow.businessTypeNotes,
      businessAddress: sellerRow.businessAddress,
      businessPhone: sellerRow.businessPhone,
      bankAccountName: sellerRow.bankAccountName,
      bankAccountNumber: sellerRow.bankAccountNumber,
      bankCode: sellerRow.bankCode,
      bankName: sellerRow.bankName,
      platformFeePercent: sellerRow.platformFeePercent,
      payoutCadence: sellerRow.payoutCadence,
      status: sellerRow.status,
    },
  };
}