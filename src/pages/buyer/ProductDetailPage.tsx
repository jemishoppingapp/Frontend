import { useParams, Link } from 'react-router-dom';
import { MOCK_PRODUCTS } from '@/data/mockData';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem, openCart } = useCartStore();
  const product = MOCK_PRODUCTS.find(p => p.id === Number(id));

  if (!product) {
    return (
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <Link to="/products" className="mt-4 inline-block text-indigo-600">← Back to Products</Link>
        </div>
    );
  }

  const handleAddToCart = () => {
    addItem({ ...product, quantity: 1 });
    openCart();
  };

  return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link to="/products" className="text-indigo-600 hover:text-indigo-500 mb-4 inline-block">← Back to Products</Link>
        <div className="grid md:grid-cols-2 gap-8 mt-4">
          <img src={product.imageSrc} alt={product.imageAlt} className="w-full rounded-lg" />
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            {product.color && <p className="text-gray-600 mt-2">{product.color}</p>}
            <p className="text-2xl font-bold mt-4 text-indigo-600">{product.price}</p>
            <p className="mt-4 text-sm text-gray-500">Category: {product.category}</p>
            <p className="mt-2 text-sm text-green-600">{product.inStock ? 'In Stock' : 'Out of Stock'}</p>
            <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-6 py-3 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
  );
}