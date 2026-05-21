'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore, type CartItem } from '@/store/cart';
import { formatCurrency } from '@/lib/utils';

/**
 * One line in the cart (sheet OR full page). Renders image, name, qty
 * stepper, line total, and a remove button.
 *
 * Compact layout for the sheet, slightly more spacious for /cart page
 * — controlled by the `compact` prop.
 */
export function CartLineItem({
  item,
  compact = false,
}: {
  item: CartItem;
  compact?: boolean;
}) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <li className="flex gap-3 py-3">
      <Link
        href={`/products/${item.slug}`}
        className={`relative ${compact ? 'h-16 w-16' : 'h-20 w-20'} shrink-0 rounded-md overflow-hidden bg-surface-muted`}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes={compact ? '64px' : '80px'}
            className="object-cover"
          />
        ) : null}
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.slug}`}
          className="block text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary"
        >
          {item.name}
        </Link>
        <p className="text-xs text-gray-400 mt-0.5 mb-1.5">{item.seller}</p>

        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center border border-border rounded-md">
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              className="tap inline-flex items-center justify-center h-8 w-8 text-gray-700 hover:bg-gray-50"
              aria-label="Decrease"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 h-8 inline-flex items-center justify-center text-sm font-semibold text-gray-900 border-x border-border">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className="tap inline-flex items-center justify-center h-8 w-8 text-gray-700 hover:bg-gray-50"
              aria-label="Increase"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <span className="text-sm font-bold text-gray-900">
            {formatCurrency(item.price * item.quantity)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => removeItem(item.productId)}
        className="tap shrink-0 inline-flex items-center justify-center h-8 w-8 text-gray-400 hover:text-red-600 transition-colors"
        aria-label={`Remove ${item.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}