import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ProductAddToCart } from './ProductAddToCart';

/**
 * ProductCard — server component. The "add to cart" button is the only
 * interactive bit, isolated into a tiny client island below.
 *
 * Layout: aspect-square image, then name, seller (subtle), price.
 * The Vite version had a hover-to-reveal "Learn more / Add" overlay
 * which is useless on mobile. We replace it with a permanent compact
 * "Add" button visible on tap-only devices, and on hover only on
 * pointer devices (set via @media (hover: hover) in the button).
 */

export interface ProductCardData {
  _id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  imageAlt: string;
  seller: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <article className="group relative bg-white rounded-lg border border-border-soft hover:border-border hover:shadow-md transition-all">
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-t-lg bg-surface-muted">
          <Image
            src={product.imageUrl}
            alt={product.imageAlt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition-transform group-hover:scale-[1.02]"
            /* Loading lazy by default — only the homepage hero image
               should use priority, and we set that explicitly there. */
          />

          {/* Rating badge — glass surface, sparing use */}
          {product.rating > 0 && (
            <div className="absolute bottom-2 left-2 glass flex items-center gap-1 px-2 py-1 rounded-md text-xs shadow-sm">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-gray-500 hidden sm:inline">
                ({product.reviewCount.toLocaleString()})
              </span>
            </div>
          )}

          {/* Out of stock overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-700 bg-white rounded-md px-2 py-1 shadow-sm">
                Out of stock
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-3 sm:p-4">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
            {product.name}
          </h3>
          <p className="text-xs text-gray-400 mb-2 line-clamp-1">
            {product.seller}
          </p>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base font-bold text-gray-900">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to cart — outside the Link so it doesn't trigger navigation */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        <ProductAddToCart product={product} compact />
      </div>
    </article>
  );
}