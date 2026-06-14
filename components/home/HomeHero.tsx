import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { Container } from '@/components/Container';

const GATES = [
  { name: 'LASU Iba Gate', note: 'Main campus entrance' },
  { name: 'Iyana Iba Gate', note: 'Iyana Iba junction side' },
];

export function HomeHero() {
  return (
    <section className="border-b border-border-soft">
      <Container className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-16 sm:py-24 lg:py-28">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-6">
            LASU campus marketplace
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-fg leading-[1.05] mb-6">
            Order online.<br />
            Pick up at the gate.<br />
            <span className="text-primary">Same day.</span>
          </h1>
          <p className="text-base sm:text-lg text-fg-2 mb-8 max-w-md leading-relaxed">
            Buy from sellers on and around campus. Pay securely, collect at
            either LASU gate for a flat ₦500. No dispatch stories.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/products"
              className="tap inline-flex items-center justify-center gap-2 px-7 h-12 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover transition-colors"
            >
              Shop now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#how-it-works"
              className="tap inline-flex items-center justify-center px-7 h-12 rounded-lg border border-border text-fg font-medium text-sm hover:bg-surface-1 transition-colors"
            >
              How it works
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border-soft bg-surface-1 p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-fg-2 font-medium mb-5">
            Pickup points
          </p>
          <ul className="space-y-5">
            {GATES.map((gate) => (
              <li key={gate.name} className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft shrink-0">
                  <MapPin className="h-4 w-4 text-primary-text" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-fg">{gate.name}</p>
                  <p className="text-xs text-fg-2 mt-0.5">{gate.note}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 pt-5 border-t border-border-soft flex items-baseline justify-between">
            <span className="text-sm text-fg-2">Delivery to gate</span>
            <span className="font-display text-lg font-bold text-fg">₦500 flat</span>
          </div>
        </div>
      </Container>
    </section>
  );
}