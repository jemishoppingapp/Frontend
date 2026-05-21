import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { CheckCircle2, Copy, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { Container } from '@/components/Container';
import { Button } from '@/components/ui/button';
import { VerifyClient } from './VerifyClient';

export const metadata: Metadata = {
  title: 'Payment Verification',
  robots: { index: false },
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const sp = await searchParams;
  // Paystack returns BOTH `reference` and `trxref` in the callback URL.
  // We prefer `reference` (the one we sent at init), fall back to `trxref`.
  const reference = sp.reference || sp.trxref;

  if (!reference) {
    return (
      <Container className="py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          No payment to verify
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          We didn't find a payment reference to confirm.
        </p>
        <Button asChild variant="default" size="tap">
          <Link href="/products">Continue shopping</Link>
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-12 max-w-2xl">
      <Suspense fallback={<VerifyLoading />}>
        <VerifyClient reference={reference} />
      </Suspense>
    </Container>
  );
}

function VerifyLoading() {
  return (
    <div className="text-center py-12">
      <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
      <p className="text-sm text-gray-600">Confirming your payment…</p>
    </div>
  );
}