import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { requireSeller } from '@/lib/seller-session';
import { SellerNewProductForm } from './SellerNewProductForm';

export const metadata: Metadata = { title: 'New Product', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function SellerNewProductPage() {
  const { seller } = await requireSeller();

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-3xl">
      <Link href="/seller/products" className="inline-flex items-center gap-1 text-sm text-fg-2 hover:text-fg mb-5">
        <ChevronLeft className="h-4 w-4" /> My products
      </Link>
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-fg mb-1">New product</h1>
      <p className="text-sm text-fg-2 mb-7">
        Listing in <span className="text-fg font-medium capitalize">{seller.businessTypeCategory}</span>
        {seller.businessTypeCategory === 'other' && ' — pick a specific category below'}.
      </p>

      <SellerNewProductForm
        sellerBusinessName={seller.businessName}
        declaredCategory={seller.businessTypeCategory}
      />
    </div>
  );
}