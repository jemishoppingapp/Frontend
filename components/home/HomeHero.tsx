import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/Container';

const HERO_IMAGE_URL =
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80';

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-border-soft">
      <Container className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center py-12 sm:py-20 lg:py-28">
        <div className="order-2 lg:order-1">
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-6">
            LASU Campus · Est. 2025
          </p>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-fg leading-[0.95] mb-6">
            Quality.<br />
            On campus.<br />
            <em className="italic font-normal text-primary not-italic font-display">Same day.</em>
          </h1>
          <p className="text-base sm:text-lg text-fg-2 mb-8 max-w-md leading-relaxed">
            The campus marketplace for things you actually need. Order online, pick up at the gate.
            No dispatch drama, no missed deliveries.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/products"
              className="tap inline-flex items-center justify-center gap-2 px-7 h-12 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary-hover transition-colors"
            >
              Shop now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#how-it-works"
              className="tap inline-flex items-center justify-center px-7 h-12 rounded-lg border border-border bg-transparent text-fg font-medium text-sm hover:bg-surface-1 transition-colors"
            >
              How it works
            </Link>
          </div>
        </div>

        <div className="order-1 lg:order-2 relative aspect-[4/3] lg:aspect-[5/6] rounded-2xl overflow-hidden bg-surface-1">
          <Image
            src={HERO_IMAGE_URL}
            alt="Shop on JEMI"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-cover object-center"
          />
        </div>
      </Container>
    </section>
  );
}