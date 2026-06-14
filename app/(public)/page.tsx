import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { and, desc, eq } from 'drizzle-orm';
import { Container } from '@/components/Container';
import { CategoryGrid } from '@/components/product/CategoryGrid';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton';
import { TimeoutDetector } from '@/components/TimeoutDetector';
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

      <section className="border-b border-border-soft">
        <Container className="py-16 sm:py-24">
          <div className="max-w-xl mb-10">
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-4">
              Shop by category
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-fg leading-tight">
              What do you need today?
            </h2>
          </div>
          <CategoryGrid />
        </Container>
      </section>

      <HowItWorks />

      <section className="border-b border-border-soft">
        <Container className="py-16 sm:py-24">
          <div className="flex items-end justify-between gap-3 mb-10">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-4">
                Featured
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-fg leading-tight">
                Picked for you.
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover whitespace-nowrap"
            >
              View all <ArrowRight className="h-4 w-4" />
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
          <div className="mt-8 sm:hidden">
            <Link
              href="/products"
              className="tap inline-flex w-full items-center justify-center gap-2 h-12 rounded-lg border border-border text-fg font-medium text-sm hover:bg-surface-1 transition-colors"
            >
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>

      <FooterCTA />
    </div>
  );
}