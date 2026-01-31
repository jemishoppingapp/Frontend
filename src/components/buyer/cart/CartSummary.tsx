import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { formatCurrency } from '@/reusable/utils/formatters';
import { FREE_DELIVERY_THRESHOLD } from '@/reusable/utils/constants';
import { cn } from '@/reusable/utils/helpers';
import Button from '@/components/ui/Button';

interface CartSummaryProps {
  subtotal: number;
  deliveryFee: number;
  total: number;
  amountToFreeDelivery: number;
  isFreeDelivery: boolean;
  onCheckout?: () => void;
  showCheckoutButton?: boolean;
  isLoading?: boolean;
}

export function CartSummary({
  subtotal,
  deliveryFee,
  total,
  amountToFreeDelivery,
  isFreeDelivery,
  onCheckout,
  showCheckoutButton = true,
  isLoading = false,
}: CartSummaryProps) {
  const freeDeliveryProgress = Math.min(
    (subtotal / FREE_DELIVERY_THRESHOLD) * 100,
    100
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

      {/* Free Delivery Progress */}
      {!isFreeDelivery && subtotal > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-700 mb-2">
            <Truck size={16} />
            <span>
              Add {formatCurrency(amountToFreeDelivery)} more for free delivery!
            </span>
          </div>
          <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${freeDeliveryProgress}%` }}
            />
          </div>
        </div>
      )}

      {isFreeDelivery && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg flex items-center gap-2 text-sm text-green-700">
          <Truck size={16} />
          <span>You've qualified for free delivery!</span>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Delivery</span>
          <span
            className={cn(
              'font-medium',
              isFreeDelivery ? 'text-green-600' : 'text-gray-900'
            )}
          >
            {isFreeDelivery ? 'FREE' : formatCurrency(deliveryFee)}
          </span>
        </div>

        <div className="h-px bg-gray-100" />

        <div className="flex justify-between">
          <span className="text-base font-semibold text-gray-900">Total</span>
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      {showCheckoutButton && (
        <div className="space-y-3">
          {onCheckout ? (
            <Button
              onClick={onCheckout}
              fullWidth
              isLoading={isLoading}
              className="h-12"
            >
              Proceed to Checkout
            </Button>
          ) : (
            <Link to="/checkout">
              <Button fullWidth className="h-12">
                Proceed to Checkout
              </Button>
            </Link>
          )}

          <Link
            to="/products"
            className="block text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
}

export default CartSummary;
