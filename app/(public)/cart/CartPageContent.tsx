'use client';

import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Container } from '@/components/Container';
import { Button } from '@/components/ui/button';
import { CartLineItem } from '@/components/cart/CartLineItem';
import { useCartStore } from '@/store/cart';
import { formatCurrency } from '@/lib/utils';

const DELIVERY_FEE = 500;

export function CartPageContent() {
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + (items.length > 0 ? DELIVERY_FEE : 0);

  if (items.length === 0) {
    return (
      <Container className="py-16 sm:py-24 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-surface-1 mb-5">
          <ShoppingBag className="h-7 w-7 text-fg-2" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-fg mb-2">Your cart is empty</h1>
        <p className="text-sm text-fg-2 mb-7 max-w-sm mx-auto">Browse products and add to your cart, they'll show up here.</p>
        <Button asChild variant="default" size="tap"><Link href="/products">Start shopping</Link></Button>
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-12">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-3">Cart</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-fg leading-tight">
          {items.length} item{items.length === 1 ? '' : 's'}
        </h1>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-10">
        <div className="bg-surface-1 rounded-2xl border border-border-soft">
          <ul className="px-5 divide-y divide-border-soft">
            {items.map((item) => <CartLineItem key={item.productId} item={item} />)}
          </ul>
        </div>

        <aside className="bg-surface-1 border border-border-soft rounded-2xl p-6 h-fit lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold text-fg mb-5">Summary</h2>
          <dl className="space-y-3 text-sm mb-5">
            <div className="flex justify-between">
              <dt className="text-fg-2">Subtotal</dt>
              <dd className="font-medium text-fg">{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-2">Delivery (LASU pickup)</dt>
              <dd className="font-medium text-fg">{formatCurrency(DELIVERY_FEE)}</dd>
            </div>
            <div className="flex justify-between pt-4 border-t border-border-soft">
              <dt className="font-display text-base font-semibold text-fg">Total</dt>
              <dd className="font-display text-base font-semibold text-fg">{formatCurrency(total)}</dd>
            </div>
          </dl>
          <Button asChild variant="default" size="tap" className="w-full">
            <Link href="/checkout">Proceed to checkout<ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <p className="text-[11px] text-fg-3 mt-3 text-center">Secure payment via Paystack. Pickup on LASU campus.</p>
        </aside>
      </div>
    </Container>
  );
}