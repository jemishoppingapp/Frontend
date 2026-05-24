import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/Container';

const NAV_LINKS = [
  { href: '/products', label: 'Shop' },
  { href: '/orders', label: 'My orders' },
  { href: '/profile', label: 'My account' },
];

const INFO_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border-soft bg-surface">
      <Container className="py-12 sm:py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 mb-10">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <Image
                src="/jemi.webp"
                alt="JEMI"
                width={40}
                height={40}
                className="h-9 w-9 object-contain"
              />
              <span className="font-display text-3xl font-bold tracking-tight text-fg">
                JEMI
              </span>
            </Link>
            <p className="text-sm text-fg-2 max-w-xs leading-relaxed">
              Your campus marketplace for quality products at LASU.
              Order online, pick up on campus.
            </p>
          </div>

          <div>
            <h3 className="text-[11px] font-medium text-fg-2 uppercase tracking-[0.18em] mb-4">
              Shop
            </h3>
            <ul className="space-y-3">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-fg hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-medium text-fg-2 uppercase tracking-[0.18em] mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {INFO_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-fg hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border-soft text-xs text-fg-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>© {year} JEMI. All rights reserved.</span>
          <span>LASU Campus Marketplace</span>
        </div>
      </Container>
    </footer>
  );
}
