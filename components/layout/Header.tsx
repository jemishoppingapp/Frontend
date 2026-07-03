import Link from 'next/link';
import Image from 'next/image';
import { Search, User, Store, LayoutDashboard } from 'lucide-react';
import { Container } from '@/components/Container';
import { HeaderMobileSearch } from './HeaderMobileSearch';
import { HeaderCartBadge } from './HeaderCartBadge';
import { getCurrentUser } from '@/lib/session';

export async function Header() {
  const user = await getCurrentUser();
  const profileHref = user ? '/profile' : '/login';

  return (
    <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-border-soft safe-top">
      <Container className="flex items-center gap-3 h-14 sm:h-16">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/jemi.webp"
            alt="JEMI"
            width={32}
            height={32}
            priority
            className="h-7 w-7 sm:h-8 sm:w-8 object-contain"
          />
          <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-fg">
            JEMI
          </span>
        </Link>

        <div className="flex-1 min-w-0">
          <form
            action="/products"
            method="get"
            className="hidden md:flex items-center bg-surface-1 hover:bg-surface-2 transition-colors rounded-full h-10 px-4 gap-2 border border-border-soft"
          >
            <Search className="h-4 w-4 text-fg-2 shrink-0" />
            <input
              name="q"
              type="search"
              placeholder="Search JEMI"
              className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-fg-3 text-fg"
            />
          </form>
          <HeaderMobileSearch />
        </div>

        <nav className="flex items-center gap-1 shrink-0">
          {user?.role === 'seller' && (
            <Link
              href="/seller"
              className="tap inline-flex items-center gap-1.5 h-10 px-3 rounded-full bg-primary-soft text-primary-text hover:opacity-90 transition-opacity text-xs font-semibold"
              aria-label="Seller dashboard"
            >
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Seller dashboard</span>
              <span className="sm:hidden">Shop</span>
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className="tap inline-flex items-center gap-1.5 h-10 px-3 rounded-full bg-primary-soft text-primary-text hover:opacity-90 transition-opacity text-xs font-semibold"
              aria-label="Admin dashboard"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
          <HeaderCartBadge />
          <Link
            href={profileHref}
            className="tap inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-surface-1 transition-colors text-fg"
            aria-label={user ? 'My Profile' : 'Sign in'}
          >
            <User className="h-[18px] w-[18px]" />
          </Link>
        </nav>
      </Container>
    </header>
  );
}