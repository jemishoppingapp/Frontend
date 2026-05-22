import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/Container';

export function FooterCTA() {
  return (
    <section className="bg-gradient-to-br from-gray-900 via-gray-900 to-primary-dark/80 text-white">
      <Container className="py-14 sm:py-20 text-center max-w-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-primary-light font-semibold mb-4">
          Ready when you are
        </p>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
          Start shopping on JEMI.
        </h2>
        <p className="text-base text-white/70 mb-7 max-w-md mx-auto">
          Browse hundreds of products. Order in minutes. Pick up the same day.
        </p>
        <Link
          href="/products"
          className="tap inline-flex items-center justify-center gap-2 px-6 h-12 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover transition-colors"
        >
          Shop the catalog
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Container>
    </section>
  );
}