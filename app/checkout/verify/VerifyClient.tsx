'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Copy, MapPin, ArrowRight, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { formatCurrency } from '@/lib/utils';

interface VerifyResult {
  status: 'paid' | 'pending' | 'failed';
  orderNumber: string;
  pickupCode: string;
  pickupLocation: string;
  total: number;
}

export function VerifyClient({ reference }: { reference: string }) {
  const clearCart = useCartStore((s) => s.clear);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Verification failed');
        if (cancelled) return;
        setResult(data);
        if (data.status === 'paid') clearCart();
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Verification failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [reference, clearCart]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="h-7 w-7 text-primary animate-spin mx-auto mb-4" />
        <p className="text-sm text-fg-2">Confirming your payment…</p>
      </div>
    );
  }

  if (error || !result || result.status !== 'paid') {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-danger/10 mb-5">
          <XCircle className="h-7 w-7 text-danger" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-fg mb-2">Payment not confirmed</h1>
        <p className="text-sm text-fg-2 mb-6 max-w-md mx-auto">
          {error || "We couldn't confirm your payment yet. If you were charged, it'll be applied automatically. Contact support if it persists."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default" size="tap"><Link href="/orders">View my orders</Link></Button>
          <Button asChild variant="outline" size="tap"><Link href="/products">Continue shopping</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary-soft mb-5">
          <CheckCircle2 className="h-7 w-7 text-primary" />
        </div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-3">Payment confirmed</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-fg mb-2 leading-tight">
          You're all set.
        </h1>
        <p className="text-sm text-fg-2">
          Order <span className="font-mono font-semibold text-fg">{result.orderNumber}</span> — {formatCurrency(result.total)}
        </p>
      </div>

      {/* Pickup code hero — the moment */}
      <div className="glass rounded-3xl p-8 sm:p-10 mb-6 text-center border border-primary-soft">
        <p className="text-[11px] uppercase tracking-[0.2em] text-fg-2 mb-3 font-medium">
          Your pickup code
        </p>
        <div className="font-mono font-bold tracking-[0.35em] text-primary text-4xl sm:text-6xl mb-5 leading-none">
          {result.pickupCode}
        </div>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(result.pickupCode);
            toast.success('Pickup code copied');
          }}
          className="tap inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-fg-1 bg-surface rounded-full border border-border-soft hover:bg-surface-1 transition-colors"
        >
          <Copy className="h-3 w-3" />
          Copy code
        </button>
      </div>

      <div className="bg-surface-1 border border-border-soft rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-fg-3 mb-1 font-medium">Pickup at</p>
            <p className="text-base font-semibold text-fg">{result.pickupLocation}</p>
            <p className="text-xs text-fg-2 mt-2">Show this code to the seller when collecting your order. We'll notify you when it's ready.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild variant="default" size="tap" className="w-full">
          <Link href="/orders">View my orders<ArrowRight className="h-4 w-4" /></Link>
        </Button>
        <Button asChild variant="outline" size="tap" className="w-full">
          <Link href="/products">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}