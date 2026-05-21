'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cart';

/**
 * Cart icon + count badge. Reads from the Zustand client cart.
 *
 * We render `null` for the count until after hydration to avoid a
 * server/client mismatch (server doesn't know what's in localStorage).
 * The icon itself renders during SSR — only the number waits.
 */
export function HeaderCartBadge() {
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <Link
      href="/cart"
      className="tap relative inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-gray-800 transition-colors"
      aria-label={`Cart${hydrated && itemCount > 0 ? ` (${itemCount} items)` : ''}`}
    >
      <ShoppingBag className="h-5 w-5" />
      {hydrated && itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}