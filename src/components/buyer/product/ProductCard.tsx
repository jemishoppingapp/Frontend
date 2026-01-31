import { Link } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import type { Product } from '@/data/mockData';
import { useCartStore } from '@/store/cartStore';

export function ProductCard({ product }: { product: Product }) {
  const { addItem, openCart } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ ...product, quantity: 1 });
    openCart();
  };

  return (
    <div className="group relative bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
      <Link to={product.href}>
        <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100">
          <img
            src={product.imageSrc}
            alt={product.imageAlt}
            className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
          />
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
          {product.color && <p className="mt-1 text-sm text-gray-500">{product.color}</p>}
          <p className="mt-1 text-lg font-semibold text-gray-900">{product.price}</p>
        </div>
      </Link>
      <button
        onClick={handleAddToCart}
        className="mt-3 w-full flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
      >
        <ShoppingCartIcon className="h-4 w-4" />
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;