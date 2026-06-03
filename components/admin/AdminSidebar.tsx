'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Briefcase,
  LogOut, Menu, X, UserCog,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api-client';

interface AdminSidebarProps {
  adminName: string;
  adminEmail: string;
  pendingSellersCount?: number;
  pendingOrdersCount?: number;
}

export function AdminSidebar({
  adminName, adminEmail,
  pendingSellersCount = 0, pendingOrdersCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const NAV = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, match: (p: string) => p === '/admin', badge: 0 },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, match: (p: string) => p.startsWith('/admin/orders'), badge: pendingOrdersCount },
    { href: '/admin/sellers', label: 'Sellers', icon: Briefcase, match: (p: string) => p.startsWith('/admin/sellers'), badge: pendingSellersCount },
    { href: '/admin/products', label: 'Products', icon: Package, match: (p: string) => p.startsWith('/admin/products'), badge: 0 },
    { href: '/admin/users', label: 'Users', icon: Users, match: (p: string) => p.startsWith('/admin/users'), badge: 0 },
    { href: '/admin/profile', label: 'My Profile', icon: UserCog, match: (p: string) => p.startsWith('/admin/profile'), badge: 0 },
  ];

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/admin/login';
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
          <Link href="/admin" className="font-display text-lg font-bold tracking-tight text-primary">
            JEMI <span className="text-fg-3 font-normal text-xs">/ admin</span>
          </Link>
          <button type="button" onClick={() => setMobileOpen(!mobileOpen)}
            className="tap p-2 -mr-2 text-fg" aria-label={mobileOpen ? 'Close menu' : 'Open menu'}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileOpen && (
          <nav className="border-t border-border-soft bg-surface px-4 py-3 space-y-1">
            {NAV.map((item) => (<NavItem key={item.href} item={item} onClick={() => setMobileOpen(false)} />))}
            <div className="pt-2 mt-2 border-t border-border-soft">
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-fg truncate">{adminName}</p>
                <p className="text-[11px] text-fg-2 truncate">{adminEmail}</p>
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
        <div className="h-16 flex items-center px-6 border-b border-border-soft">
          <Link href="/admin" className="font-display text-xl font-bold tracking-tight text-primary">
            JEMI <span className="text-fg-3 font-normal text-sm">/ admin</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => (<NavItem key={item.href} item={item} />))}
        </nav>

        <div className="border-t border-border-soft p-3">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-medium text-fg truncate">{adminName}</p>
            <p className="text-[11px] text-fg-2 truncate">{adminEmail}</p>
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