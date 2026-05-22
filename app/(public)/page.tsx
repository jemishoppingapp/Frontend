import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { and, desc, eq } from 'drizzle-orm';
import { Container } from '@/components/Container';
import { CategoryGrid } from '@/components/product/CategoryGrid';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton';
import { TimeoutDetector } from '@/components/TimeoutDetector';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import { HomeHero } from '@/components/home/HomeHero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { TrustStrip } from '@/components/home/TrustStrip';
import { FooterCTA } from '@/components/home/FooterCTA';
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
      <HomeHero />
      <TrustStrip />

      {/* Categories */}
      <RevealOnScroll as="section">
        <Container className="py-12 sm:py-16">
          <div className="text-center max-w-xl mx-auto mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">
              Shop by category
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">
              What do you need today?
            </h2>
          </div>
          <CategoryGrid />
        </Container>
      </RevealOnScroll>

      <HowItWorks />

      {/* Featured */}
      <RevealOnScroll as="section">
        <Container className="py-12 sm:py-16">
          <div className="flex items-end justify-between gap-3 mb-6 sm:mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-2">
                Featured
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">
                This week's picks
              </h2>
            </div>
            <Link
              href="/products"
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors inline-flex items-center gap-1 shrink-0"
            >
              See all
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
      </RevealOnScroll>

      <FooterCTA />
    </div>
  );
}