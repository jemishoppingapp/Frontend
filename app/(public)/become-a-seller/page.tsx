import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Clock, Wallet, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/Container';

export const metadata: Metadata = {
  title: 'Sell on JEMI',
  description: 'Sell your products to LASU students. Set up your store in minutes, get paid weekly via Paystack.',
};

const STEPS = [
  { n: '01', title: 'Apply', body: 'Fill out a short application with your business details and bank info.' },
  { n: '02', title: 'Get approved', body: 'We review your application within 48 hours. We email you once you can start listing.' },
  { n: '03', title: 'List products', body: 'Upload photos, set prices, and your products go live on JEMI.' },
  { n: '04', title: 'Get paid', body: 'Buyers pay through JEMI. Your share lands in your bank account at settlement.' },
];

const PERKS = [
  { icon: Wallet, title: 'Keep 95%', body: 'JEMI takes a flat 5% per sale. No setup fees, no monthly fees.' },
  { icon: Clock, title: 'Same-day pickup', body: 'Buyers collect at LASU Iba Gate or Iyana Iba Gate. Less logistics for you.' },
  { icon: ShieldCheck, title: 'Secure payments', body: 'All payments via Paystack. We hold funds until pickup confirmation.' },
  { icon: Check, title: 'Built-in audience', body: 'Reach LASU students who are already shopping. No marketing budget needed.' },
];

export default function BecomeSellerPage() {
  return (
    <div className="seller-shell">
      <section className="border-b border-border-soft">
        <Container className="py-16 sm:py-24 lg:py-28">
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-6">
            For sellers · LASU campus
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-semibold text-fg leading-[0.95] mb-6 max-w-3xl">
            Sell to LASU.<br />
            <em className="italic font-normal text-primary not-italic font-display">Earn from campus.</em>
          </h1>
          <p className="text-base sm:text-lg text-fg-2 mb-8 max-w-xl leading-relaxed">
            Set up your store in minutes. List products. Get paid securely while we handle payments, fulfillment coordination, and customer support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/sellers/apply"
              className="tap inline-flex items-center justify-center gap-2 px-7 h-12 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary-hover transition-colors"
            >
              Apply to sell
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#how-it-works"
              className="tap inline-flex items-center justify-center px-7 h-12 rounded-lg border border-border bg-transparent text-fg font-medium text-sm hover:bg-surface-1 transition-colors"
            >
              How it works
            </Link>
          </div>
        </Container>
      </section>

      <section className="border-b border-border-soft bg-surface-1">
        <Container className="py-16 sm:py-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {PERKS.map((perk) => {
              const Icon = perk.icon;
              return (
                <div key={perk.title}>
                  <Icon className="h-6 w-6 text-primary mb-4" />
                  <h3 className="font-display text-base font-semibold text-fg mb-1">{perk.title}</h3>
                  <p className="text-sm text-fg-2 leading-relaxed">{perk.body}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section id="how-it-works" className="border-b border-border-soft">
        <Container className="py-16 sm:py-24">
          <div className="max-w-xl mb-12">
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-4">
              How it works
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-fg leading-tight">
              Four steps to your first sale.
            </h2>
          </div>

          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {STEPS.map((step) => (
              <li key={step.n}>
                <div className="font-display text-5xl sm:text-6xl font-medium text-fg-3 mb-4">
                  {step.n}
                </div>
                <h3 className="font-display text-xl font-semibold text-fg mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-fg-2 leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section>
        <Container className="py-16 sm:py-24 lg:py-32 max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-5">
            Ready when you are
          </p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-fg leading-[1.0] mb-6">
            Apply <em className="italic font-normal text-primary not-italic font-display">today.</em>
          </h2>
          <p className="text-base sm:text-lg text-fg-2 mb-8 max-w-lg leading-relaxed">
            Takes about 5 minutes. We'll review and email you within 48 hours.
          </p>
          <Link
            href="/sellers/apply"
            className="tap inline-flex items-center justify-center gap-2 px-7 h-12 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary-hover transition-colors"
          >
            Apply to sell
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Container>
      </section>
    </div>
  );
}
