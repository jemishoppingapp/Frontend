import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { ProductGrid } from '@/components/buyer/product/ProductGrid';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/data/mockData';

export default function HomePage() {
  // Get featured products (first 8)
  const featuredProducts = MOCK_PRODUCTS.slice(0, 8);

  return (
    <div className="bg-white">
      {/* Category Grid - with images */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {MOCK_CATEGORIES.map((category) => (
              <Link
                  key={category.id}
                  to={category.href}
                  className="group flex flex-col items-center p-5 bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-md transition-all border border-transparent hover:border-green-200"
              >
                <div className="w-20 h-20 mb-3 rounded-lg overflow-hidden bg-white shadow-sm">
                  <img
                      src={category.imageSrc}
                      alt={category.name}
                      className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{category.description}</p>
              </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
            <Link 
              to="/products" 
              className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              View All
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-5">
            {featuredProducts.map((product) => (
              <div key={product.id}>
                <Link to={product.href} className="block">
                  <div className="product-card group relative bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                    {/* Image */}
                    <div className="relative aspect-square w-full overflow-hidden rounded-t-lg bg-gray-50">
                      <img
                        src={product.imageSrc}
                        alt={product.imageAlt}
                        className="h-full w-full object-cover object-center"
                      />
                      {/* Rating badge */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
                        <span className="text-sm font-semibold text-gray-900">{product.rating}</span>
                        <svg className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs text-gray-500">({product.reviewCount.toLocaleString()})</span>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mb-2">{product.name}</h3>
                      <div className="space-y-1.5 mb-3">
                        {product.features.slice(0, 2).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <svg className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs text-gray-500 line-clamp-1">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-gray-900">{product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">{product.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Shop With Us - Simple */}
      <div className="bg-gray-50 border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl mb-2">🏫</div>
              <h3 className="text-sm font-semibold text-gray-900">Campus Pickup</h3>
              <p className="text-xs text-gray-500 mt-1">LASU Main Gate</p>
            </div>
            <div>
              <div className="text-2xl mb-2">✓</div>
              <h3 className="text-sm font-semibold text-gray-900">Quality Products</h3>
              <p className="text-xs text-gray-500 mt-1">100% Authentic</p>
            </div>
            <div>
              <div className="text-2xl mb-2">💬</div>
              <h3 className="text-sm font-semibold text-gray-900">Easy Support</h3>
              <p className="text-xs text-gray-500 mt-1">WhatsApp Available</p>
            </div>
            <div>
              <div className="text-2xl mb-2">💰</div>
              <h3 className="text-sm font-semibold text-gray-900">Best Prices</h3>
              <p className="text-xs text-gray-500 mt-1">Student Friendly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}