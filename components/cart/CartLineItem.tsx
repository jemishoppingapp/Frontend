'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore, type CartItem } from '@/store/cart';
import { formatCurrency } from '@/lib/utils';

export function CartLineItem({ item, compact = false }: { item: CartItem; compact?: boolean }) {
  const { updateQuantity, removeItem } = useCartStore();
  return (
    <li className="flex gap-3 py-4">
      <Link
        href={`/products/${item.slug}`}
        className={`relative ${compact ? 'h-16 w-16' : 'h-20 w-20'} shrink-0 rounded-lg overflow-hidden bg-surface-1`}
      >
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill sizes={compact ? '64px' : '80px'} className="object-cover" />
        ) : null}
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.slug}`} className="block text-sm font-medium text-fg line-clamp-2 hover:text-primary">
          {item.name}
        </Link>
        <p className="text-[11px] text-fg-3 mt-0.5 mb-2">{item.seller}</p>

        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center border border-border rounded-full">
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              className="tap inline-flex items-center justify-center h-8 w-8 text-fg-1 hover:bg-surface-1 rounded-l-full"
              aria-label="Decrease"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 h-8 inline-flex items-center justify-center text-sm font-medium text-fg">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className="tap inline-flex items-center justify-center h-8 w-8 text-fg-1 hover:bg-surface-1 rounded-r-full"
              aria-label="Increase"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <span className="font-display text-sm font-semibold text-fg">
            {formatCurrency(item.price * item.quantity)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => removeItem(item.productId)}
        className="tap shrink-0 inline-flex items-center justify-center h-8 w-8 text-fg-3 hover:text-danger transition-colors"
        aria-label={`Remove ${item.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}