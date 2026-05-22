import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/Container';

/**
 * HomeHero — full-bleed hero with photo on the right.
 *
 * Replace HERO_IMAGE_URL with your real Cloudinary URL when you have
 * the photo. Current default is an Unsplash placeholder (Nigerian
 * student with shopping).
 */
const HERO_IMAGE_URL =
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80';

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-light/40 via-white to-white">
      {/* Decorative green-tinted blob in the top-left, subtle */}
      <div
        aria-hidden
        className="absolute -top-32 -left-32 w-80 h-80 bg-primary-light rounded-full blur-3xl opacity-50 pointer-events-none"
      />

      <Container className="relative grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-10 sm:py-16 lg:py-20">
        {/* Copy */}
        <div className="order-2 lg:order-1">
          <div className="inline-flex items-center gap-1.5 bg-primary-light text-primary-dark text-xs font-semibold px-3 py-1 rounded-full mb-5">
            <ShieldCheck className="h-3 w-3" aria-hidden />
            LASU campus only
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.05] mb-5">
            Quality. On campus.{' '}
            <span className="text-primary">Same day.</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-7 max-w-md leading-relaxed">
            Shop the things you need at student-friendly prices and pick them up at the campus
            gate. No waiting on dispatch, no missed deliveries.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/products"
              className="tap inline-flex items-center justify-center gap-2 px-6 h-12 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover transition-colors"
            >
              Shop now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#how-it-works"
              className="tap inline-flex items-center justify-center px-6 h-12 rounded-md border border-border bg-white text-gray-900 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              How it works
            </Link>
          </div>
        </div>

        {/* Photo */}
        <div className="order-1 lg:order-2 relative aspect-[4/3] lg:aspect-square rounded-2xl overflow-hidden bg-surface-muted">
          <Image
            src={HERO_IMAGE_URL}
            alt="Shop on JEMI"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-cover object-center"
          />
          {/* Subtle dark gradient at the bottom for any caption legibility */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
          />
        </div>
      </Container>
    </section>
  );
}