'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/store/cart';
import { formatCurrency, cn } from '@/lib/utils';
import { apiFetch, ApiError } from '@/lib/api-client';

const DELIVERY_FEE = 500;
const DELIVERY_ZONES = [
  { slug: 'lasu-iba-gate', name: 'LASU Iba Gate', description: 'Main entrance' },
  { slug: 'iyana-iba-gate', name: 'Iyana Iba Gate', description: 'Iyana Iba bus stop' },
];

interface InitResp {
  authorization_url: string;
  reference: string;
  orderId: string;
  orderNumber: string;
}

export function CheckoutForm({ user }: { user: { id: string; email: string; name: string } }) {
  const items = useCartStore((s) => s.items);

  const [zone, setZone] = useState(DELIVERY_ZONES[0].slug);
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + DELIVERY_FEE;

  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-surface-1 rounded-2xl border border-border-soft">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-surface mb-4">
          <ShoppingBag className="h-5 w-5 text-fg-2" />
        </div>
        <p className="text-sm text-fg-2 mb-4">Your cart is empty — nothing to checkout.</p>
        <Button asChild variant="default" size="tap"><Link href="/products">Start shopping</Link></Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please describe your pickup location on campus.');
      return;
    }
    setSubmitting(true);
    try {
      const data = await apiFetch<InitResp>('/api/payment/initialize', {
        method: 'POST',
        body: {
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          deliveryZone: zone,
          deliveryDescription: description.trim(),
          customerNote: note.trim(),
        },
      });
      window.location.href = data.authorization_url;
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        if (err.code === 'PROFILE_INCOMPLETE') {
          setTimeout(() => { window.location.href = '/profile/complete?from=/checkout'; }, 1500);
        }
      } else {
        toast.error('Something went wrong. Please try again.');
      }
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_380px] gap-10">
      <div className="space-y-6">
        <section className="bg-surface-1 border border-border-soft rounded-2xl p-6">
          <h2 className="font-display text-base font-semibold text-fg mb-5">Contact</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-fg-1">Name</Label>
              <Input id="name" value={user.name} disabled className="mt-1.5 bg-surface" />
            </div>
            <div>
              <Label htmlFor="email" className="text-fg-1">Email</Label>
              <Input id="email" value={user.email} disabled className="mt-1.5 bg-surface" />
            </div>
          </div>
          <p className="text-[11px] text-fg-3 mt-3">We'll send your order confirmation here.</p>
        </section>

        <section className="bg-surface-1 border border-border-soft rounded-2xl p-6">
          <h2 className="font-display text-base font-semibold text-fg mb-5">Pickup location</h2>
          <div className="space-y-2 mb-5">
            {DELIVERY_ZONES.map((z) => (
              <label
                key={z.slug}
                className={cn(
                  'flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors',
                  zone === z.slug ? 'border-primary bg-primary-soft/40' : 'border-border bg-surface hover:border-border-strong'
                )}
              >
                <input type="radio" name="zone" value={z.slug} checked={zone === z.slug} onChange={() => setZone(z.slug)} className="mt-1 accent-primary" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-fg">{z.name}</p>
                  <p className="text-xs text-fg-2 mt-0.5">{z.description}</p>
                </div>
                <span className="text-sm font-medium text-fg">{formatCurrency(DELIVERY_FEE)}</span>
              </label>
            ))}
          </div>

          <div className="mb-4">
            <Label htmlFor="description" className="text-fg-1">
              Describe exactly where on campus <span className="text-danger">*</span>
            </Label>
            <Input
              id="description" value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Hall 4, Block C, Room 12" required className="mt-1.5 bg-surface"
            />
          </div>
          <div>
            <Label htmlFor="note" className="text-fg-1">Note for seller (optional)</Label>
            <Input
              id="note" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Any special instructions" className="mt-1.5 bg-surface"
            />
          </div>
        </section>
      </div>

      <aside className="bg-surface-1 border border-border-soft rounded-2xl p-6 h-fit lg:sticky lg:top-24">
        <h2 className="font-display text-base font-semibold text-fg mb-5">Summary</h2>
        <ul className="space-y-2 mb-5 pb-5 border-b border-border-soft">
          {items.map((item) => (
            <li key={item.productId} className="flex items-center justify-between gap-2 text-sm">
              <span className="text-fg-1 line-clamp-1">
                {item.name} <span className="text-fg-3">×{item.quantity}</span>
              </span>
              <span className="font-medium text-fg whitespace-nowrap">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="space-y-2 text-sm mb-5">
          <div className="flex justify-between"><dt className="text-fg-2">Subtotal</dt><dd className="text-fg">{formatCurrency(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-fg-2">Delivery</dt><dd className="text-fg">{formatCurrency(DELIVERY_FEE)}</dd></div>
          <div className="flex justify-between pt-4 border-t border-border-soft">
            <dt className="font-display text-base font-semibold text-fg">Total</dt>
            <dd className="font-display text-base font-semibold text-fg">{formatCurrency(total)}</dd>
          </div>
        </dl>
        <Button type="submit" variant="default" size="tap" className="w-full" disabled={submitting}>
          {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" />Connecting to Paystack…</>) : `Pay ${formatCurrency(total)}`}
        </Button>
        <p className="text-[11px] text-fg-3 mt-3 text-center">Secure payment via Paystack. You'll get a pickup code on confirmation.</p>
      </aside>
    </form>
  );
}