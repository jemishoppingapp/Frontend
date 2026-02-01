import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { ShoppingBagIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const total = items.reduce((sum, item) => sum + item.priceValue * item.quantity, 0);

  if (items.length === 0) {
    return (
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h2>
          <Link to="/products" className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
            Continue Shopping
          </Link>
        </div>
    );
  }

  return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
        <div className="space-y-4">
          {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 border-b pb-4">
                <img src={item.imageSrc} alt={item.imageAlt} className="h-20 w-20 rounded object-cover" />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-gray-600">{item.price}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 border rounded">-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 border rounded">+</button>
                  </div>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-red-600 p-2">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
          ))}
        </div>
        <div className="mt-8 flex justify-between items-center">
          <button onClick={clearCart} className="text-gray-600 hover:text-gray-800">Clear Cart</button>
          <div className="text-right">
            <p className="text-lg font-bold">Total: ₦{total.toLocaleString()}</p>
            <Link to="/checkout" className="mt-2 inline-block rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700">
              Checkout
            </Link>
          </div>
        </div>
      </div>
  );
}