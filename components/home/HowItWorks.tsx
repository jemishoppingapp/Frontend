import { ShoppingBag, CreditCard, MapPin } from 'lucide-react';
import { Container } from '@/components/Container';

const STEPS = [
  {
    n: '01',
    icon: ShoppingBag,
    title: 'Order online',
    body: 'Browse, add to cart, and checkout in a couple of minutes.',
  },
  {
    n: '02',
    icon: CreditCard,
    title: 'Pay securely',
    body: 'Card, bank transfer, or USSD via Paystack. Encrypted, never stored.',
  },
  {
    n: '03',
    icon: MapPin,
    title: 'Pick up on campus',
    body: 'Show your pickup code at LASU Iba Gate or Iyana Iba Gate. Done.',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-gray-900 text-white relative overflow-hidden"
    >
      {/* subtle decorative green glow */}
      <div
        aria-hidden
        className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"
      />

      <Container className="relative py-14 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">
            How it works
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
            From cart to campus in three steps.
          </h2>
        </div>

        <ol className="grid sm:grid-cols-3 gap-5 sm:gap-6">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <li
                key={step.n}
                className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="h-11 w-11 rounded-xl bg-primary/15 inline-flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" aria-hidden />
                  </div>
                  <span className="font-display text-2xl font-bold text-white/30">
                    {step.n}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">{step.body}</p>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}