import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCart } from '@/reusable/hooks/useCart';
import CartItem from '@/components/buyer/cart/CartItem';
import CartSummary from '@/components/buyer/cart/CartSummary';
import EmptyCart from '@/components/buyer/cart/EmptyCart';
import Button from '@/components/ui/Button';

export function CartPage() {
  const {
    items,
    isEmpty,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    deliveryFee,
    total,
    amountToFreeDelivery,
    isFreeDelivery,
  } = useCart();

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyCart />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/products"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Shopping Cart ({items.length})
            </h1>
          </div>
          <Button variant="ghost" onClick={clearCart} className="text-red-500 hover:text-red-600">
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <CartSummary
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                total={total}
                amountToFreeDelivery={amountToFreeDelivery}
                isFreeDelivery={isFreeDelivery}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
