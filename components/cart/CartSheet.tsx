'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { CartLineItem } from './CartLineItem';
import { useCartStore } from '@/store/cart';
import { formatCurrency } from '@/lib/utils';

export function CartSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (n: boolean) => void; }) {
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (!open) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-surface">
        <SheetHeader className="px-5 py-4 border-b border-border-soft m-0">
          <SheetTitle className="font-display text-lg text-fg">Your Cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div className="h-14 w-14 rounded-full bg-surface-1 inline-flex items-center justify-center mb-4">
              <ShoppingBag className="h-6 w-6 text-fg-2" />
            </div>
            <h3 className="font-display text-lg font-semibold text-fg mb-1">Your cart is empty</h3>
            <p className="text-sm text-fg-2 mb-6 max-w-xs">Add products to your cart and they will show up here.</p>
            <Button asChild variant="default" size="tap" onClick={() => onOpenChange(false)}>
              <Link href="/products">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-5 divide-y divide-border-soft">
              {items.map((item) => <CartLineItem key={item.productId} item={item} compact />)}
            </ul>

            <div className="border-t border-border-soft p-5 space-y-3 safe-bottom">
              <div className="flex items-center justify-between text-sm">
                <span className="text-fg-2">Subtotal</span>
                <span className="font-display font-semibold text-fg">{formatCurrency(subtotal)}</span>
              </div>
              <p className="text-[11px] text-fg-3">Delivery fee added at checkout.</p>
              <Button asChild variant="default" size="tap" className="w-full" onClick={() => onOpenChange(false)}>
                <Link href="/cart">View cart &amp; checkout</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}