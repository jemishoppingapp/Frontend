import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { and, eq } from 'drizzle-orm';
import { Check, ShoppingBag, Star, ChevronRight } from 'lucide-react';
import { Container } from '@/components/Container';
import { Badge } from '@/components/ui/badge';
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
    console.error('[product detail] fetch failed:', err);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = await fetchProduct(slug);
  if (!doc) {
    return { title: 'Product not found' };
  }
  const firstImage = doc.images?.[0]?.url;
  return {
    title: doc.name,
    description: doc.description?.slice(0, 160) ?? `${doc.name} on JEMI — LASU campus marketplace.`,
    openGraph: {
      title: doc.name,
      description: doc.description?.slice(0, 160),
      images: firstImage
        ? [{ url: firstImage, width: 1200, height: 1200, alt: doc.name }]
        : undefined,
      type: 'website',
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) {
    notFound();
  }

  const price = Number(product.price);
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : undefined;
  const rating = Number(product.rating);

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
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: product.seller },
    },
    ...(rating > 0 && product.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  return (
    <Container className="py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-gray-500">
        <ol className="flex items-center gap-1">
          <li>
            <Link href="/" className="hover:text-primary">Home</Link>
          </li>
          <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
          <li>
            <Link href={`/products?category=${product.category}`} className="hover:text-primary capitalize">
              {product.category}
            </Link>
          </li>
          <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
          <li className="text-gray-700 truncate max-w-[150px] sm:max-w-xs">{product.name}</li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
        <ProductImageGallery images={galleryImages} productName={product.name} />

        <div>
          <div className="text-xs text-gray-500 mb-2">{product.seller}</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            {product.name}
          </h1>

          {rating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < Math.round(rating)
                        ? 'h-4 w-4 fill-yellow-400 text-yellow-400'
                        : 'h-4 w-4 text-gray-300'
                    }
                    aria-hidden
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-900">
                {rating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">
                ({product.reviewCount.toLocaleString()} reviews)
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-3xl font-bold text-gray-900">
              {formatCurrency(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatCurrency(originalPrice)}
                </span>
                <Badge variant="success">
                  Save {formatCurrency(originalPrice - price)}
                </Badge>
              </>
            )}
          </div>

          <div className="mb-5">
            {product.inStock ? (
              <Badge variant="success">In stock</Badge>
            ) : (
              <Badge variant="danger">Out of stock</Badge>
            )}
          </div>

          {product.description && (
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              {product.description}
            </p>
          )}

          {product.features.length > 0 && (
            <ul className="space-y-2 mb-6">
              {product.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
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

          <div className="mt-6 pt-6 border-t border-border-soft grid grid-cols-2 gap-4 text-xs text-gray-600">
            <div className="flex items-start gap-2">
              <ShoppingBag className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden />
              <div>
                <div className="font-semibold text-gray-900 mb-0.5">On-campus pickup</div>
                <div>LASU Iba Gate &amp; Iyana Iba Gate</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden />
              <div>
                <div className="font-semibold text-gray-900 mb-0.5">Pickup code</div>
                <div>Shown after payment confirmation</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}