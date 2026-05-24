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

      <RevealOnScroll as="section">
        <Container className="py-16 sm:py-24">
          <div className="max-w-xl mb-10">
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-4">
              Shop by category
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-fg leading-tight">
              What do you need today?
            </h2>
          </div>
          <CategoryGrid />
        </Container>
      </RevealOnScroll>

      <HowItWorks />

      <RevealOnScroll as="section">
        <Container className="py-16 sm:py-24">
          <div className="flex items-end justify-between gap-3 mb-10">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-3">
                Featured
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-fg leading-tight">
                This week's picks
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-fg-2 hover:text-fg transition-colors shrink-0 mb-1"
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