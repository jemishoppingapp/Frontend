'use client';

import { Moon, Sun } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();

  // Hide on auth and admin paths
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/admin')
  ) {
    return null;
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'theme-toggle-btn fixed z-50',
        'right-4 bottom-[calc(56px+env(safe-area-inset-bottom)+1rem)]',
        'md:bottom-6',
        'inline-flex items-center justify-center',
        'h-10 w-10 rounded-full',
        'bg-surface-1 hover:bg-surface-2',
        'border border-border-soft',
        'shadow-md',
        'text-fg'
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}