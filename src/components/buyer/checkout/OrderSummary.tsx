import { useCart } from '@/reusable/hooks/useCart';
import { formatCurrency } from '@/reusable/utils/formatters';
import { cn } from '@/reusable/utils/helpers';
import CartItem from '../cart/CartItem';

interface OrderSummaryProps {
  compact?: boolean;
  showItems?: boolean;
}

export function OrderSummary({ compact = false, showItems = true }: OrderSummaryProps) {
  const {
    items,
    subtotal,
    deliveryFee,
    total,
    isFreeDelivery,
    updateQuantity,
    removeItem,
  } = useCart();

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-100',
        compact ? 'p-4' : 'p-6'
      )}
    >
      <h3 className={cn('font-semibold text-gray-900 mb-4', compact ? 'text-base' : 'text-lg')}>
        Order Summary
      </h3>

      {/* Items List */}
      {showItems && (
        <div className={cn('mb-4', compact ? 'max-h-48' : 'max-h-64', 'overflow-y-auto')}>
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
              compact={compact}
            />
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-gray-100 my-4" />

      {/* Price Breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})
          </span>
          <span className="font-medium text-gray-900">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Delivery Fee</span>
          <span
            className={cn(
              'font-medium',
              isFreeDelivery ? 'text-green-600' : 'text-gray-900'
            )}
          >
            {isFreeDelivery ? 'FREE' : formatCurrency(deliveryFee)}
          </span>
        </div>

        <div className="h-px bg-gray-200 my-2" />

        <div className="flex justify-between">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="text-xl font-bold text-gray-900">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default OrderSummary;
