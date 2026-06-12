import type { Metadata } from 'next';
import { requireSeller } from '@/lib/seller-session';
import { SellerProfileForm } from './SellerProfileForm';

export const metadata: Metadata = { title: 'My Profile', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function SellerProfilePage() {
  const { user, seller } = await requireSeller();

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-3xl">
      <div className="mb-7">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-fg mb-1">My profile</h1>
        <p className="text-sm text-fg-2">Manage your business info.</p>
      </div>

      <SellerProfileForm
        user={{ email: user.email, name: user.name, phone: user.phone }}
        seller={{
          businessName: seller.businessName,
          businessTypeCategory: seller.businessTypeCategory,
          businessTypeNotes: seller.businessTypeNotes,
          businessAddress: seller.businessAddress,
          businessPhone: seller.businessPhone,
          bankName: seller.bankName,
          bankAccountName: seller.bankAccountName,
          bankAccountNumber: seller.bankAccountNumber,
          platformFeePercent: seller.platformFeePercent,
        }}
      />
    </div>
  );
}