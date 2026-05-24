import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { and, eq } from 'drizzle-orm';
import { Check, ShoppingBag, Star, ChevronRight } from 'lucide-react';
import { Container } from '@/components/Container';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { ProductDetailActions } from '@/components/product/ProductDetailActions';
import { db, schema } from '@/db';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

async function fetchProduct(slug: string) {
  try {
    const rows = await db()
      .select()
      .from(schema.products)
      .where(and(eq(schema.products.slug, slug), eq(schema.products.isActive, true)))
      .limit(1);
    return rows[0] ?? null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[product detail]', err);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = await fetchProduct(slug);
  if (!doc) return { title: 'Product not found' };
  const firstImage = doc.images?.[0]?.url;
  return {
    title: doc.name,
    description: doc.description?.slice(0, 160) ?? `${doc.name} on JEMI.`,
    openGraph: {
      title: doc.name,
      description: doc.description?.slice(0, 160),
      images: firstImage ? [{ url: firstImage, width: 1200, height: 1200, alt: doc.name }] : undefined,
      type: 'website',
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) notFound();

  const price = Number(product.price);
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : undefined;
  const rating = Number(product.rating);
  const hasDiscount = originalPrice && originalPrice > price;

  const galleryImages =
    product.images.length > 0
      ? product.images.map((i) => ({ url: i.url, alt: i.alt || product.name }))
      : [{ url: '', alt: product.name }];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.url).filter(Boolean),
    sku: product.id,
    brand: { '@type': 'Brand', name: product.seller },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: 'NGN',
      price,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: product.seller },
    },
    ...(rating > 0 && product.reviewCount > 0
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: rating, reviewCount: product.reviewCount } }
      : {}),
  };

  return (
    <Container className="py-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-fg-3">
        <ol className="flex items-center gap-1.5">
          <li><Link href="/" className="hover:text-fg">Home</Link></li>
          <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
          <li><Link href={`/products?category=${product.category}`} className="hover:text-fg capitalize">{product.category}</Link></li>
          <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
          <li className="text-fg-2 truncate max-w-[150px] sm:max-w-xs">{product.name}</li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
        <ProductImageGallery images={galleryImages} productName={product.name} />

        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-fg-3 mb-3">
            {product.seller}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-fg leading-tight mb-4">
            {product.name}
          </h1>

          {rating > 0 && (
            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i}
                    className={i < Math.round(rating) ? 'h-4 w-4 fill-warning text-warning' : 'h-4 w-4 text-fg-3'}
                    aria-hidden
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-fg">{rating.toFixed(1)}</span>
              <span className="text-xs text-fg-3">({product.reviewCount.toLocaleString()} reviews)</span>
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-display text-3xl sm:text-4xl font-semibold text-fg">
              {formatCurrency(price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-base text-fg-3 line-through">
                  {formatCurrency(originalPrice!)}
                </span>
                <span className="text-xs font-medium text-primary bg-primary-soft px-2 py-1 rounded-full">
                  Save {formatCurrency(originalPrice! - price)}
                </span>
              </>
            )}
          </div>

          <div className="mb-6">
            {product.inStock ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                In stock
              </span>
            ) : (
              <span className="text-xs font-medium text-danger">Out of stock</span>
            )}
          </div>

          {product.description && (
            <p className="text-sm text-fg-1 mb-6 leading-relaxed">{product.description}</p>
          )}

          {product.features.length > 0 && (
            <ul className="space-y-2.5 mb-8">
              {product.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-fg-1">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}

          <ProductDetailActions
            product={{
              _id: product.id,
              slug: product.slug,
              name: product.name,
              price,
              imageUrl: galleryImages[0]?.url ?? '',
              seller: product.seller,
              inStock: product.inStock,
              stockQuantity: product.stockQuantity,
            }}
          />

          <div className="mt-8 pt-8 border-t border-border-soft grid grid-cols-2 gap-6 text-xs text-fg-2">
            <div className="flex items-start gap-2.5">
              <ShoppingBag className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden />
              <div>
                <p className="font-medium text-fg mb-0.5">On-campus pickup</p>
                <p>LASU Iba Gate &amp; Iyana Iba Gate</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden />
              <div>
                <p className="font-medium text-fg mb-0.5">Pickup code</p>
                <p>Shown after payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}