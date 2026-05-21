import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingBag, User } from 'lucide-react';
import { Container } from '@/components/Container';
import { HeaderMobileSearch } from './HeaderMobileSearch';
import { HeaderCartBadge } from './HeaderCartBadge';
import { HeaderCategories } from './HeaderCategories';

/**
 * Header — dark, two rows on mobile (logo+actions, category scroll),
 * single row on desktop.
 *
 * Server component. The cart badge, search sheet, and category scroll
 * are small client islands inside for interactivity.
 *
 * Height target on mobile: ~88px total (48 + 40). The Vite header was
 * ~140px — 50px reclaimed for product real estate above the fold.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-gray-900 text-white safe-top">
      {/* Top row — logo, search, actions */}
      <Container className="flex items-center gap-3 h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/jemi.webp"
            alt="JEMI"
            width={32}
            height={32}
            priority
            className="h-8 w-auto"
          />
          <span className="text-lg font-bold tracking-tight hidden sm:inline">
            JEMI
          </span>
        </Link>

        {/* Search — inline on desktop, sheet trigger on mobile */}
        <div className="flex-1 min-w-0">
          {/* Desktop inline search */}
          <form
            action="/products"
            method="get"
            className="hidden md:flex items-center bg-gray-800 hover:bg-gray-700 transition-colors rounded-md h-10 px-3 gap-2"
          >
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              name="q"
              type="search"
              placeholder="Search products on JEMI"
              className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-gray-400 text-white"
            />
          </form>
          {/* Mobile search trigger (opens full-screen Sheet) */}
          <HeaderMobileSearch />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <HeaderCartBadge />
          <Link
            href="/profile"
            className="tap inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-gray-800 transition-colors"
            aria-label="Profile"
          >
            <User className="h-5 w-5" />
          </Link>
        </div>
      </Container>

      {/* Second row — horizontal scroll categories on all screens.
          Desktop sees them too; on mobile this is the primary nav. */}
      <div className="border-t border-gray-800">
        <Container className="h-10 flex items-center">
          <HeaderCategories />
        </Container>
      </div>
    </header>
  );
}

export { ShoppingBag };