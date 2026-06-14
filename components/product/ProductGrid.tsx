import { PackageOpen } from 'lucide-react';
import { ProductCard, type ProductCardData } from './ProductCard';

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-border-soft bg-surface-1 py-16 px-6 text-center">
        <PackageOpen className="h-8 w-8 text-fg-3 mx-auto mb-4" aria-hidden />
        <p className="text-sm font-semibold text-fg mb-1">Nothing here yet</p>
        <p className="text-sm text-fg-2 max-w-sm mx-auto">
          Sellers are setting up their shops. Check back soon — new products
          land here the moment they go live.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}