import { Container } from '@/components/Container';

const STEPS = [
  {
    n: '01',
    title: 'Order online',
    body: 'Browse, add to cart, and checkout in a couple of minutes.',
  },
  {
    n: '02',
    title: 'Pay securely',
    body: 'Card, bank transfer, or USSD via Paystack. Encrypted, never stored.',
  },
  {
    n: '03',
    title: 'Pick up on campus',
    body: 'Show your code at LASU Iba Gate or Iyana Iba Gate. Done.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border-soft">
      <Container className="py-16 sm:py-24">
        <div className="max-w-xl mb-12 sm:mb-16">
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-4">
            How it works
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-fg leading-tight">
            From cart to campus in three steps.
          </h2>
        </div>

        <ol className="grid sm:grid-cols-3 gap-8 sm:gap-10">
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
  );
}