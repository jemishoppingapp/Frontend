'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, Store, ShoppingBag, Package, User } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { cn } from '@/lib/utils';

/**
 * Mobile-only bottom nav. Five tabs: Home, Shop, Cart, Orders, Profile.
 * Hidden on md+ (≥768px). 56px tall. Adds the equivalent padding to
 * <body> via globals.css so content doesn't slide under it.
 *
 * The active tab is detected via pathname prefix. /products/[slug]
 * still highlights "Shop", /orders/JM-XXX still highlights "Orders".
 */
const TABS = [
  { href: '/', label: 'Home', icon: Home, match: (p: string) => p === '/' },
  { href: '/products', label: 'Shop', icon: Store, match: (p: string) => p.startsWith('/products') },
  { href: '/cart', label: 'Cart', icon: ShoppingBag, match: (p: string) => p.startsWith('/cart') || p.startsWith('/checkout') },
  { href: '/orders', label: 'Orders', icon: Package, match: (p: string) => p.startsWith('/orders') },
  { href: '/profile', label: 'You', icon: User, match: (p: string) => p.startsWith('/profile') },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Hide on auth pages — they have their own minimal layout.
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return null;
  }

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border safe-bottom"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5 h-14">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          const showBadge = tab.href === '/cart' && hydrated && itemCount > 0;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-0.5 h-full transition-colors',
                  active ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" aria-hidden />
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[9px] font-bold rounded-full h-3.5 min-w-3.5 px-1 flex items-center justify-center">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-medium">{tab.label}</span>
                {active && (
                  <span
                    aria-hidden
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-primary rounded-full"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}