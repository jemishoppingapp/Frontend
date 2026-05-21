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
      <Container className="py-12 sm:py-16 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-surface-muted mb-4">
          <ShoppingBag className="h-7 w-7 text-gray-400" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Your cart is empty
        </h1>
        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
          Browse products and add to your cart, they'll show up here.
        </p>
        <Button asChild variant="default" size="tap">
          <Link href="/products">Start shopping</Link>
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-6 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
        Your Cart
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({items.length} item{items.length === 1 ? '' : 's'})
        </span>
      </h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        {/* Items */}
        <div className="border border-border-soft rounded-lg bg-white">
          <ul className="px-4 divide-y divide-border-soft">
            {items.map((item) => (
              <CartLineItem key={item.productId} item={item} />
            ))}
          </ul>
        </div>

        {/* Summary */}
        <aside className="border border-border-soft rounded-lg bg-white p-5 h-fit lg:sticky lg:top-28">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Order Summary
          </h2>
          <dl className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <dt className="text-gray-600">Subtotal</dt>
              <dd className="font-medium text-gray-900">{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Delivery (LASU pickup)</dt>
              <dd className="font-medium text-gray-900">{formatCurrency(DELIVERY_FEE)}</dd>
            </div>
            <div className="flex justify-between pt-3 border-t border-border-soft">
              <dt className="text-base font-bold text-gray-900">Total</dt>
              <dd className="text-base font-bold text-gray-900">
                {formatCurrency(total)}
              </dd>
            </div>
          </dl>
          <Button asChild variant="default" size="tap" className="w-full">
            <Link href="/checkout">
              Proceed to checkout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="text-[11px] text-gray-500 mt-3 text-center">
            Secure payment via Paystack. Pickup on LASU campus.
          </p>
        </aside>
      </div>
    </Container>
  );
}