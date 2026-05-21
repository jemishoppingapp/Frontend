import Link from 'next/link';
import { Container } from '@/components/Container';

const NAV_LINKS = [
  { href: '/products', label: 'Shop' },
  { href: '/orders', label: 'My Orders' },
  { href: '/profile', label: 'My Account' },
];

const INFO_LINKS = [
  { href: '/about', label: 'About JEMI' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border-soft bg-surface-muted mt-12">
      <Container className="py-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div className="col-span-2 sm:col-span-1">
            <div className="text-lg font-bold tracking-tight text-primary mb-2">
              JEMI
            </div>
            <p className="text-sm text-gray-600 max-w-xs">
              Your trusted campus marketplace for quality products at LASU.
              Order online, pick up on campus.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Shop
            </h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Company
            </h3>
            <ul className="space-y-2">
              {INFO_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border-soft text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>© {year} JEMI. All rights reserved.</span>
          <span className="text-gray-400">LASU Campus Marketplace</span>
        </div>
      </Container>
    </footer>
  );
}