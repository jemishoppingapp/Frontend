import { useSearchParams } from 'react-router-dom';
import { ProductGrid } from '@/components/buyer/product/ProductGrid';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, getProductsByCategory } from '@/data/mockData';

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';

  let products = category === 'all' ? MOCK_PRODUCTS : getProductsByCategory(category);
  if (search) {
    products = products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.category.toLowerCase().includes(search.toLowerCase())
    );
  }

  const categoryName = category === 'all' 
    ? 'All Products' 
    : MOCK_CATEGORIES.find(c => c.id === category)?.name || 'Products';

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex text-sm">
            <a href="/" className="text-gray-500 hover:text-gray-700">Home</a>
            <span className="mx-2 text-gray-400">»</span>
            <span className="text-gray-900 font-medium">
              {search ? `Search: "${search}"` : categoryName}
            </span>
          </nav>
        </div>
      </div>

      {/* Results */}
      {products.length > 0 ? (
        <ProductGrid 
          products={products} 
          title={search ? `Results for "${search}" (${products.length})` : `${categoryName} (${products.length})`} 
        />
      ) : (
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-6">
            {search ? `No results for "${search}"` : 'This category is empty'}
          </p>
          <a 
            href="/products" 
            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            View All Products
          </a>
        </div>
      )}
    </div>
  );
}