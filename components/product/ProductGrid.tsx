import { ProductCard, type ProductCardData } from './ProductCard';

/**
 * Responsive product grid.
 *   - 2 columns on phones (most products fit on screen, no horizontal scroll)
 *   - 3 on tablets
 *   - 4 on desktop, 5 on wide
 */
export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-gray-500">
        No products to show right now.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}