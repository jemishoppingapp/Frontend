import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { and, desc, eq } from 'drizzle-orm';
import { Container } from '@/components/Container';
import { CategoryGrid } from '@/components/product/CategoryGrid';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton';
import { TimeoutDetector } from '@/components/TimeoutDetector';
import { db, schema } from '@/db';
import type { ProductCardData } from '@/components/product/ProductCard';

export const dynamic = 'force-dynamic';

async function getFeaturedProducts(): Promise<ProductCardData[]> {
  try {
    const rows = await db()
      .select()
      .from(schema.products)
      .where(and(eq(schema.products.isActive, true), eq(schema.products.isFeatured, true)))
      .orderBy(desc(schema.products.createdAt))
      .limit(8);

    return rows.map((d) => ({
      _id: d.id,
      slug: d.slug,
      name: d.name,
      // numeric columns come back as string; convert at boundary.
      price: Number(d.price),
      originalPrice: d.originalPrice ? Number(d.originalPrice) : undefined,
      imageUrl: d.images?.[0]?.url ?? '',
      imageAlt: d.images?.[0]?.alt ?? d.name,
      seller: d.seller,
      rating: Number(d.rating),
      reviewCount: d.reviewCount,
      inStock: d.inStock,
    }));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[home] getFeaturedProducts failed:', err);
    return [];
  }
}

async function FeaturedProducts() {
  const products = await getFeaturedProducts();
  return <ProductGrid products={products} />;
}

export default function HomePage() {
  return (
    <div>
      <Container className="py-6">
        <CategoryGrid />
      </Container>

      <div className="border-t border-border-soft">
        <Container className="py-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Featured Products
            </h2>
            <Link
              href="/products"
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <Suspense
            fallback={
              <TimeoutDetector>
                <ProductGridSkeleton count={8} />
              </TimeoutDetector>
            }
          >
            <FeaturedProducts />
          </Suspense>
        </Container>
      </div>
    </div>
  );
}