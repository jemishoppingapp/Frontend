import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { ProductGrid } from '@/components/buyer/product/ProductGrid';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/data/mockData';

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Category Cards */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {MOCK_CATEGORIES.map((category) => (
            <Link key={category.id} to={category.href} className="group relative overflow-hidden rounded-lg bg-gray-100 aspect-square">
              <img src={category.imageSrc} alt={category.name} className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                <p className="text-sm text-gray-200">{category.description}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-white">Shop Now <ArrowRightIcon className="h-4 w-4" /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      {/* All Products */}
      <ProductGrid products={MOCK_PRODUCTS} title="All Products" />
    </div>
  );
}