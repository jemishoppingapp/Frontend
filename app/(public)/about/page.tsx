import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/Container';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <Container className="py-12 sm:py-16 max-w-2xl">
      <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-3">About</p>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold text-fg leading-tight mb-8">
        The campus marketplace, built for LASU.
      </h1>

      <div className="space-y-6 text-sm sm:text-base text-fg-1 leading-relaxed">
        <p>
          JEMI is where LASU students buy and sell. Order online, pick up at the
          gate the same day, pay when you collect. No dispatch stories, no
          "seller is coming" — our rep meets you at LASU Iba Gate or Iyana Iba
          Gate with your order.
        </p>
        <p>
          For sellers, JEMI is the simplest way to reach the whole campus: list
          your products, we handle the gate handover, you get paid to your bank.
          You see exactly what you earn on every listing before you publish it.
        </p>
        <p>
          We're students building for students, starting right here at LASU.
        </p>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <Link
          href="/products"
          className="tap inline-flex items-center justify-center gap-2 px-7 h-12 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover transition-colors"
        >
          Start shopping <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/become-a-seller"
          className="tap inline-flex items-center justify-center px-7 h-12 rounded-lg border border-border text-fg font-medium text-sm hover:bg-surface-1 transition-colors"
        >
          Sell on JEMI
        </Link>
      </div>
    </Container>
  );
}