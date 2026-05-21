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

    async function go() {
      try {
        const res = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Verification failed');
        }
        if (cancelled) return;
        setResult(data);
        // On confirmed payment, clear the cart now (not at init time —
        // an abandoned checkout shouldn't lose the user's cart).
        if (data.status === 'paid') {
          clearCart();
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Verification failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    go();

    return () => {
      cancelled = true;
    };
  }, [reference, clearCart]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-600">Confirming your payment…</p>
      </div>
    );
  }

  if (error || !result || result.status !== 'paid') {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4">
          <XCircle className="h-7 w-7 text-red-600" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Payment not confirmed
        </h1>
        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
          {error ||
            "We couldn't confirm your payment yet. If you were charged, the payment will be applied automatically. Please contact support if this persists."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default" size="tap">
            <Link href="/orders">View my orders</Link>
          </Button>
          <Button asChild variant="outline" size="tap">
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Happy path — paid
  return (
    <div>
      {/* Success hero */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="h-7 w-7 text-green-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Payment confirmed
        </h1>
        <p className="text-sm text-gray-600">
          Order <span className="font-mono font-semibold">{result.orderNumber}</span> — {formatCurrency(result.total)}
        </p>
      </div>

      {/* Pickup code card — the one place glass earns its keep */}
      <div className="glass rounded-2xl p-6 sm:p-8 mb-6 text-center shadow-md border border-primary-light">
        <p className="text-xs uppercase tracking-wider text-gray-600 mb-2 font-medium">
          Your pickup code
        </p>
        <div className="text-4xl sm:text-5xl font-bold tracking-[0.3em] text-primary-dark mb-4 font-mono">
          {result.pickupCode}
        </div>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(result.pickupCode);
            toast.success('Pickup code copied');
          }}
          className="tap inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 bg-white/70 rounded-full hover:bg-white transition-colors"
        >
          <Copy className="h-3 w-3" />
          Copy code
        </button>
      </div>

      {/* Pickup location */}
      <div className="border border-border-soft rounded-lg bg-white p-5 mb-6">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-1 font-medium">
              Pickup at
            </div>
            <div className="text-base font-semibold text-gray-900">
              {result.pickupLocation}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Show this code to the seller when collecting your order.
              We'll notify you when it's ready.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild variant="default" size="tap" className="w-full">
          <Link href={`/orders`}>
            View my orders
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="tap" className="w-full">
          <Link href="/products">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}