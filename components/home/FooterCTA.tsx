import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/Container';

export function FooterCTA() {
  return (
    <section className="border-y border-border-soft">
      <Container className="py-16 sm:py-24 lg:py-32 max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-5">
          Ready when you are
        </p>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-fg leading-[1.0] mb-6">
          Start shopping <em className="italic font-normal text-primary not-italic font-display">on JEMI.</em>
        </h2>
        <p className="text-base sm:text-lg text-fg-2 mb-8 max-w-lg leading-relaxed">
          Browse hundreds of products. Order in minutes. Pick up the same day.
        </p>
        <Link
          href="/products"
          className="tap inline-flex items-center justify-center gap-2 px-7 h-12 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary-hover transition-colors"
        >
          Shop the catalog
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Container>
    </section>
  );
}