import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { Container } from '@/components/Container';
import { SellerApplyForm } from './SellerApplyForm';

export const metadata: Metadata = { title: 'Sell on JEMI · Apply', robots: { index: false } };

export default async function SellerApplyPage() {
  // If they're already signed in as a seller, don't show the form
  const user = await getCurrentUser();
  if (user?.role === 'seller') {
    redirect('/sellers/pending');
  }
  if (user?.role === 'admin') {
    redirect('/admin');
  }
  // Buyers: we still let them see the form, but we'll bounce them at submit
  // because they need a fresh email per the architecture decision.

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="border-b border-border-soft">
        <Container className="h-14 sm:h-16 flex items-center justify-between">
          <Link href="/become-a-seller" className="font-display text-xl font-bold tracking-tight text-primary">
            JEMI <span className="text-fg-3 font-normal text-sm">/ sellers</span>
          </Link>
          <Link href="/" className="text-sm text-fg-2 hover:text-fg">Back to JEMI</Link>
        </Container>
      </header>
      <main className="flex-1 py-8 sm:py-12">
        <Container className="max-w-2xl">
          <div className="mb-8">
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-3">Seller application</p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-fg leading-tight">Apply to sell on JEMI.</h1>
            <p className="text-sm text-fg-2 mt-2">
              Takes ~5 minutes. We review applications within 48 hours and email you to let you know when you can start listing.
            </p>
          </div>
          <SellerApplyForm />
        </Container>
      </main>
    </div>
  );
}