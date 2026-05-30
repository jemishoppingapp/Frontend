import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { ChevronLeft } from 'lucide-react';
import { db, schema } from '@/db';
import { ProductEditForm } from './ProductEditForm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Edit Product', robots: { index: false } };

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const rows = await db().select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
  const product = rows[0];
  if (!product) notFound();

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-3xl">
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-fg-2 hover:text-fg mb-5">
        <ChevronLeft className="h-4 w-4" /> All products
      </Link>
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-fg mb-1">Edit product</h1>
      <p className="text-sm text-fg-2 mb-7 font-mono">{product.slug}</p>

      <ProductEditForm product={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description ?? '',
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
        category: product.category,
        seller: product.seller,
        stockQuantity: product.stockQuantity,
        inStock: product.inStock,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        features: product.features ?? [],
        imageUrl: product.images?.[0]?.url ?? '',
      }} />
    </div>
  );
}