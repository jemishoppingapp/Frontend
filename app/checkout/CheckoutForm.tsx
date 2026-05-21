'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/store/cart';
import { formatCurrency, cn } from '@/lib/utils';

const DELIVERY_FEE = 500;
const DELIVERY_ZONES = [
  { slug: 'lasu-iba-gate', name: 'LASU Iba Gate', description: 'Main entrance' },
  { slug: 'iyana-iba-gate', name: 'Iyana Iba Gate', description: 'Iyana Iba bus stop' },
];

export function CheckoutForm({
  user,
}: {
  user: { id: string; email: string; name: string };
}) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);

  const [zone, setZone] = useState(DELIVERY_ZONES[0].slug);
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + DELIVERY_FEE;

  if (items.length === 0) {
    return (
      <div className="text-center py-12 border border-border-soft rounded-lg bg-white">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-surface-muted mb-4">
          <ShoppingBag className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Your cart is empty — nothing to checkout.
        </p>
        <Button asChild variant="default" size="tap">
          <Link href="/products">Start shopping</Link>
        </Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please describe your pickup location on campus');
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          deliveryZone: zone,
          deliveryDescription: description.trim(),
          customerNote: note.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment initialization failed');
      }

      // Cart isn't cleared yet — only after verify confirms payment.
      // If the user closes the tab now, their cart is still intact.

      // Redirect the browser to Paystack
      window.location.href = data.authorization_url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(msg);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_360px] gap-8">
      <div className="space-y-6">
        {/* Contact */}
        <section className="border border-border-soft rounded-lg bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Contact</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={user.name} disabled className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled className="mt-1" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            We'll send your order confirmation here.
          </p>
        </section>

        {/* Delivery */}
        <section className="border border-border-soft rounded-lg bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Pickup location
          </h2>
          <div className="space-y-2 mb-4">
            {DELIVERY_ZONES.map((z) => (
              <label
                key={z.slug}
                className={cn(
                  'flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors',
                  zone === z.slug
                    ? 'border-primary bg-primary-light/30'
                    : 'border-border hover:border-primary/40'
                )}
              >
                <input
                  type="radio"
                  name="zone"
                  value={z.slug}
                  checked={zone === z.slug}
                  onChange={() => setZone(z.slug)}
                  className="mt-1 accent-primary"
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">
                    {z.name}
                  </div>
                  <div className="text-xs text-gray-500">{z.description}</div>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(DELIVERY_FEE)}
                </div>
              </label>
            ))}
          </div>

          <div className="mb-4">
            <Label htmlFor="description">
              Describe exactly where on campus <span className="text-red-600">*</span>
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Hall 4, Block C, Room 12"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="note">Note for seller (optional)</Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any special instructions"
              className="mt-1"
            />
          </div>
        </section>
      </div>

      {/* Summary */}
      <aside className="border border-border-soft rounded-lg bg-white p-5 h-fit lg:sticky lg:top-28">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Order Summary
        </h2>
        <ul className="space-y-2 mb-4 pb-4 border-b border-border-soft">
          {items.map((item) => (
            <li
              key={item.productId}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span className="text-gray-700 line-clamp-1">
                {item.name}{' '}
                <span className="text-gray-400">×{item.quantity}</span>
              </span>
              <span className="font-medium text-gray-900 whitespace-nowrap">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <dt className="text-gray-600">Subtotal</dt>
            <dd className="text-gray-900">{formatCurrency(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Delivery</dt>
            <dd className="text-gray-900">{formatCurrency(DELIVERY_FEE)}</dd>
          </div>
          <div className="flex justify-between pt-3 border-t border-border-soft">
            <dt className="text-base font-bold text-gray-900">Total</dt>
            <dd className="text-base font-bold text-gray-900">
              {formatCurrency(total)}
            </dd>
          </div>
        </dl>
        <Button
          type="submit"
          variant="default"
          size="tap"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting to Paystack…
            </>
          ) : (
            `Pay ${formatCurrency(total)}`
          )}
        </Button>
        <p className="text-[11px] text-gray-500 mt-3 text-center">
          Secure payment via Paystack. You'll get a pickup code on confirmation.
        </p>
      </aside>
    </form>
  );
}