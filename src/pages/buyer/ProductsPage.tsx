import { useSearchParams } from 'react-router-dom';
import { ProductGrid } from '@/components/buyer/product/ProductGrid';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, getProductsByCategory } from '@/data/mockData';

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';

  let products = category === 'all' ? MOCK_PRODUCTS : getProductsByCategory(category);
  if (search) {
    products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));
  }

  const categoryName = category === 'all' ? 'All Products' : MOCK_CATEGORIES.find(c => c.id === category)?.name || 'Products';

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          <a href="/products" className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${category === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All</a>
          {MOCK_CATEGORIES.map((cat) => (
            <a key={cat.id} href={cat.href} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${category === cat.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{cat.name}</a>
          ))}
        </div>
      </div>
      {products.length > 0 ? (
        <ProductGrid products={products} title={search ? `Results for "${search}"` : categoryName} />
      ) : (
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8"><p className="text-gray-500">No products found.</p></div>
      )}
    </div>
  );
}