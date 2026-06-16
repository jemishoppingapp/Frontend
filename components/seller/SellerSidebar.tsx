'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Package, ShoppingBag, UserCog,
  LogOut, Menu, X, Banknote,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api-client';

interface SellerSidebarProps {
  sellerName: string;
  businessName: string;
  sellerEmail: string;
  pendingOrdersCount?: number;
}

export function SellerSidebar({
  sellerName, businessName, sellerEmail,
  pendingOrdersCount = 0,
}: SellerSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const NAV = [
    { href: '/seller', label: 'Dashboard', icon: LayoutDashboard, match: (p: string) => p === '/seller', badge: 0 },
    { href: '/seller/products', label: 'My Products', icon: Package, match: (p: string) => p.startsWith('/seller/products'), badge: 0 },
    { href: '/seller/orders', label: 'Orders', icon: ShoppingBag, match: (p: string) => p.startsWith('/seller/orders'), badge: pendingOrdersCount },
    { href: '/seller/payouts', label: 'Payouts', icon: Banknote, match: (p: string) => p.startsWith('/seller/payouts'), badge: 0 },
    { href: '/seller/profile', label: 'Profile', icon: UserCog, match: (p: string) => p.startsWith('/seller/profile'), badge: 0 },
  ];

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch {
      setSigningOut(false);
      toast.error('Could not sign out');
    }
  }

  const NavItem = ({ item, onClick }: { item: typeof NAV[number]; onClick?: () => void }) => {
    const Icon = item.icon;
    const active = item.match(pathname);
    return (
      <Link href={item.href} onClick={onClick}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          active ? 'bg-primary-soft text-primary-text' : 'text-fg-1 hover:bg-surface-1'
        )}>
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1">{item.label}</span>
        {item.badge > 0 && (
          <span className={cn(
            'inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-semibold',
            active ? 'bg-fg text-fg-inverse' : 'bg-warning text-white'
          )}>
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-surface border-b border-border-soft">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/seller" className="flex items-center gap-2 min-w-0">
            <span className="font-display text-lg font-bold tracking-tight text-primary shrink-0">JEMI</span>
            <span className="text-fg-3 font-normal text-xs truncate">/ {businessName}</span>
          </Link>
          <button type="button" onClick={() => setMobileOpen(!mobileOpen)}
            className="tap p-2 -mr-2 text-fg shrink-0" aria-label={mobileOpen ? 'Close menu' : 'Open menu'}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileOpen && (
          <nav className="border-t border-border-soft bg-surface px-4 py-3 space-y-1">
            {NAV.map((item) => (<NavItem key={item.href} item={item} onClick={() => setMobileOpen(false)} />))}
            <div className="pt-2 mt-2 border-t border-border-soft">
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-fg truncate">{sellerName}</p>
                <p className="text-[11px] text-fg-2 truncate">{sellerEmail}</p>
              </div>
              <button type="button" onClick={handleSignOut} disabled={signingOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-fg-1 hover:bg-surface-1">
                <LogOut className="h-4 w-4 shrink-0" />
                {signingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-surface border-r border-border-soft h-screen sticky top-0">
        <div className="h-16 flex flex-col justify-center px-6 border-b border-border-soft">
          <Link href="/seller" className="font-display text-xl font-bold tracking-tight text-primary leading-tight">
            JEMI
          </Link>
          <span className="text-[11px] text-fg-2 truncate">{businessName}</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => (<NavItem key={item.href} item={item} />))}
        </nav>

        <div className="border-t border-border-soft p-3">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-medium text-fg truncate">{sellerName}</p>
            <p className="text-[11px] text-fg-2 truncate">{sellerEmail}</p>
          </div>
          <button type="button" onClick={handleSignOut} disabled={signingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-fg-1 hover:bg-surface-1 transition-colors">
            <LogOut className="h-4 w-4 shrink-0" />
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>
    </>
  );
}