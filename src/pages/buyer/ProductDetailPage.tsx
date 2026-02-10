import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';
import { HeartIcon, CheckCircleIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/data/mockData';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCartStore();
  const { showToast } = useUIStore();
  const [quantity, setQuantity] = useState(1);
  
  const product = MOCK_PRODUCTS.find(p => p.id === Number(id));
  const category = product ? MOCK_CATEGORIES.find(c => c.id === product.category) : null;

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="text-4xl mb-4">😕</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Product not found</h1>
        <Link to="/products" className="text-sm text-green-600 hover:text-green-500">
          ← Back to Products
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({ ...product, quantity });
    showToast('success', `${product.name} added to cart`);
  };

  const decreaseQty = () => setQuantity(q => Math.max(1, q - 1));
  const increaseQty = () => setQuantity(q => Math.min(10, q + 1));

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <span className="mx-2 text-gray-400">»</span>
            {category && (
              <>
                <Link to={category.href} className="text-gray-500 hover:text-gray-700">{category.name}</Link>
                <span className="mx-2 text-gray-400">»</span>
              </>
            )}
            <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden">
            <img 
              src={product.imageSrc} 
              alt={product.imageAlt} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div>
            {/* Title + Wishlist */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <HeartIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon 
                    key={star}
                    className={`h-4 w-4 ${star <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">({product.reviewCount})</span>
              <button className="text-sm text-green-600 hover:text-green-500 ml-2">
                Add your review &gt;
              </button>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-6">
              <span className="text-3xl font-bold text-gray-900">{product.price}</span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through">{product.originalPrice}</span>
              )}
            </div>

            {/* Divider */}
            <hr className="my-6 border-gray-200" />

            {/* Features */}
            <div className="space-y-4">
              {product.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <hr className="my-6 border-gray-200" />

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Qty</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button 
                  onClick={decreaseQty}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <button 
                  onClick={increaseQty}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  disabled={quantity >= 10}
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 py-3 px-6 text-sm font-medium border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add to Cart
              </button>
              <button
                onClick={() => {
                  handleAddToCart();
                  window.location.href = '/checkout';
                }}
                disabled={!product.inStock}
                className="flex-1 py-3 px-6 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Buy It Now
              </button>
            </div>

            {/* Stock status */}
            <p className={`text-sm mt-4 ${product.inStock ? 'text-green-600' : 'text-red-500'}`}>
              {product.inStock ? '✓ In Stock - Ready for pickup' : '✗ Out of Stock'}
            </p>

            {/* Seller */}
            <p className="text-xs text-gray-500 mt-2">
              Sold by: <span className="font-medium">{product.seller}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}