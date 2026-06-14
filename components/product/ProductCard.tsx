import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ProductAddToCart } from './ProductAddToCart';

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
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <article>
      <Link href={`/products/${product.slug}`} className="block group">
        <div className="relative aspect-square w-full overflow-hidden bg-surface-1 rounded-xl mb-3 border border-border-soft group-hover:border-border transition-colors">
          <Image
            src={product.imageUrl}
            alt={product.imageAlt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center"
          />

          {hasDiscount && discountPercent >= 5 && (
            <span className="absolute top-2.5 left-2.5 bg-primary text-primary-foreground px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
              -{discountPercent}%
            </span>
          )}

          {!product.inStock && (
            <div className="absolute inset-0 bg-surface/85 flex items-center justify-center">
              <span className="text-xs font-medium text-fg px-3 py-1.5 rounded-full border border-border bg-surface">
                Out of stock
              </span>
            </div>
          )}
        </div>

        <div>
          <p className="text-[11px] text-fg-3 mb-1">{product.seller}</p>
          <h3 className="text-sm font-medium text-fg line-clamp-2 mb-2 leading-snug">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-display text-base sm:text-lg font-bold text-fg">
              {formatCurrency(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-fg-3 line-through">
                {formatCurrency(product.originalPrice!)}
              </span>
            )}
            {product.rating > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-fg-2">
                <Star className="h-3 w-3 fill-warning text-warning" />
                {product.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="mt-3">
        <ProductAddToCart product={product} compact />
      </div>
    </article>
  );
}