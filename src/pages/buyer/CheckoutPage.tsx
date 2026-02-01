import { Link } from 'react-router-dom';

export default function CheckoutPage() {
  return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p className="text-gray-600 mb-8">Checkout coming soon - connect to FastAPI backend</p>
        <Link to="/cart" className="text-indigo-600 hover:text-indigo-500">← Back to Cart</Link>
      </div>
  );
}