import { Truck, Shield, Clock, Users } from 'lucide-react';
import { Container } from '@/components/Container';

const ITEMS = [
  { icon: Truck, label: 'On-campus delivery', sub: '₦500 flat to either gate' },
  { icon: Shield, label: 'Secure payments', sub: 'Paystack-powered checkout' },
  { icon: Clock, label: 'Same-day pickup', sub: 'Orders ready in hours' },
  { icon: Users, label: 'Built for students', sub: 'By students, for students' },
];

export function TrustStrip() {
  return (
    <section className="border-y border-border-soft bg-surface-muted">
      <Container className="py-8 sm:py-10">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {ITEMS.map((it) => {
            const Icon = it.icon;
            return (
              <li
                key={it.label}
                className="bg-white border border-border-soft rounded-xl p-4 flex items-start gap-3"
              >
                <div className="h-10 w-10 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-primary-dark" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{it.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{it.sub}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}