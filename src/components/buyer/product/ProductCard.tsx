import { Link } from 'react-router-dom';
import { StarIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import type { Product } from '@/data/mockData';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  const { showToast } = useUIStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ ...product, quantity: 1 });
    showToast('success', `${product.name} added to cart`);
  };

  return (
    <div className="product-card group relative bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
      <Link to={product.href}>
        {/* Image container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-t-lg bg-gray-50">
          <img
            src={product.imageSrc}
            alt={product.imageAlt}
            className="h-full w-full object-cover object-center"
          />
          
          {/* Rating badge - Oraimo style */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
            <span className="text-sm font-semibold text-gray-900">{product.rating}</span>
            <StarIcon className="h-3.5 w-3.5 text-yellow-400" />
            <span className="text-xs text-gray-500">({product.reviewCount.toLocaleString()})</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Product name */}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mb-2">
            {product.name}
          </h3>

          {/* Features */}
          <div className="space-y-1.5 mb-3">
            {product.features.slice(0, 2).map((feature, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <CheckCircleIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-500 line-clamp-1">{feature}</span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-gray-900">{product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">{product.originalPrice}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Hover actions - Oraimo style */}
      <div className="product-card-actions absolute bottom-0 left-0 right-0 p-4 pt-2 bg-gradient-to-t from-white via-white to-transparent">
        <div className="flex gap-2">
          <Link 
            to={product.href}
            className="flex-1 text-center py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Learn More
          </Link>
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors"
          >
            <ShoppingCartIcon className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;