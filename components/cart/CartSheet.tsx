'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { CartLineItem } from './CartLineItem';
import { useCartStore } from '@/store/cart';
import { formatCurrency } from '@/lib/utils';

/**
 * Cart sheet — slides in from the right when the header cart button is
 * clicked. The cart icon in the header is rendered separately
 * (HeaderCartBadge) and uses the same `useCartStore` to count items.
 *
 * NOTE: per Tenderville gotcha #4, we only mount the Sheet conditionally
 * (`{open && <Sheet ...>}`) so the Radix overlay doesn't render an
 * invisible backdrop when conceptually closed.
 */
export function CartSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (!open) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col"
      >
        <SheetHeader className="px-4 py-3 border-b border-border-soft m-0">
          <SheetTitle className="text-base">Your Cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div className="h-16 w-16 rounded-full bg-surface-muted inline-flex items-center justify-center mb-4">
              <ShoppingBag className="h-7 w-7 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              Your cart is empty
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
              Add products to your cart and they will show up here.
            </p>
            <Button asChild variant="default" size="tap" onClick={() => onOpenChange(false)}>
              <Link href="/products">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-4 divide-y divide-border-soft">
              {items.map((item) => (
                <CartLineItem key={item.productId} item={item} compact />
              ))}
            </ul>

            <div className="border-t border-border-soft p-4 space-y-3 safe-bottom">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Delivery fee and discounts calculated at checkout.
              </p>
              <Button
                asChild
                variant="default"
                size="tap"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                <Link href="/cart">View cart &amp; checkout</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}