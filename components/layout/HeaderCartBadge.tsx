'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { CartSheet } from '@/components/cart/CartSheet';

export function HeaderCartBadge() {
  const [open, setOpen] = useState(false);
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="tap relative inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-surface-1 transition-colors text-fg"
        aria-label={`Cart${hydrated && itemCount > 0 ? ` (${itemCount} items)` : ''}`}
      >
        <ShoppingBag className="h-[18px] w-[18px]" />
        {hydrated && itemCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>
      <CartSheet open={open} onOpenChange={setOpen} />
    </>
  );
}