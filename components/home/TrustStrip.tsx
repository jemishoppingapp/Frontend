import { Truck, Shield, Clock, Users } from 'lucide-react';
import { Container } from '@/components/Container';

const ITEMS = [
  { icon: Truck, label: 'On-campus pickup', sub: '₦500 flat to either gate' },
  { icon: Shield, label: 'Secure payments', sub: 'Paystack-powered' },
  { icon: Clock, label: 'Same-day pickup', sub: 'Orders ready in hours' },
  { icon: Users, label: 'Built for students', sub: 'By students, for students' },
];

export function TrustStrip() {
  return (
    <section className="border-b border-border-soft bg-surface-1">
      <Container className="py-10 sm:py-12">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {ITEMS.map((it) => {
            const Icon = it.icon;
            return (
              <li key={it.label} className="flex items-start gap-3">
                <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-fg leading-tight">{it.label}</p>
                  <p className="text-xs text-fg-2 mt-1">{it.sub}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}