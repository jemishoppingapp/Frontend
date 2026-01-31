import { Minus, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/reusable/utils/helpers';
import { formatCurrency } from '@/reusable/utils/formatters';
import type { CartItem as CartItemType } from '@/reusable/types';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string, name: string) => void;
  compact?: boolean;
}

export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  compact = false,
}: CartItemProps) {
  const { productId, name, price, image, quantity, stock } = item;
  const subtotal = price * quantity;

  const handleIncrement = () => {
    if (quantity < stock) {
      onUpdateQuantity(productId, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onUpdateQuantity(productId, quantity - 1);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-2">
        <img
          src={image || '/placeholder-product.jpg'}
          alt={name}
          className="w-12 h-12 rounded-lg object-cover bg-gray-100"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
          <p className="text-sm text-gray-500">
            {quantity} × {formatCurrency(price)}
          </p>
        </div>
        <p className="text-sm font-semibold text-gray-900">
          {formatCurrency(subtotal)}
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      {/* Product Image */}
      <img
        src={image || '/placeholder-product.jpg'}
        alt={name}
        className="w-20 h-20 rounded-lg object-cover bg-gray-100 flex-shrink-0"
      />

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{name}</h3>
        <p className="mt-1 text-sm font-semibold text-indigo-600">
          {formatCurrency(price)}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className={cn(
                'p-1.5 text-gray-500 hover:text-gray-700 transition-colors',
                quantity <= 1 && 'opacity-50 cursor-not-allowed'
              )}
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span className="px-3 py-1 text-sm font-medium text-gray-900 min-w-[2rem] text-center">
              {quantity}
            </span>
            <button
              onClick={handleIncrement}
              disabled={quantity >= stock}
              className={cn(
                'p-1.5 text-gray-500 hover:text-gray-700 transition-colors',
                quantity >= stock && 'opacity-50 cursor-not-allowed'
              )}
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            onClick={() => onRemove(productId, name)}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Remove item"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-gray-900">
          {formatCurrency(subtotal)}
        </p>
      </div>
    </div>
  );
}

export default CartItem;
