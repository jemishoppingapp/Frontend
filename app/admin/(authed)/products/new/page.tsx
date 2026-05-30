import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { NewProductForm } from './NewProductForm';

export const metadata: Metadata = { title: 'New Product', robots: { index: false } };

export default function AdminNewProductPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-3xl">
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-fg-2 hover:text-fg mb-5">
        <ChevronLeft className="h-4 w-4" /> All products
      </Link>
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-fg mb-1">New product</h1>
      <p className="text-sm text-fg-2 mb-7">Create a new product. You can edit it later.</p>

      <NewProductForm />
    </div>
  );
}