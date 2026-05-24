'use client';

import { Moon, Sun } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

/**
 * Floating theme toggle — bottom-right on every page except auth.
 * On mobile, sits above the bottom nav (which is 56px tall).
 *
 * Uses Sun/Moon icons from lucide-react, matching Claude's pattern.
 * Icon swaps based on which theme would activate on click (shows what
 * you'll get, not what you have).
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();

  // Hide on auth pages (login/register have minimal shells)
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
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
        // Position: bottom-right, lifted above mobile bottom nav (56px)
        // and safe-area inset on devices with home indicator
        'right-4 bottom-[calc(56px+env(safe-area-inset-bottom)+1rem)]',
        'md:bottom-6',
        // Visual: pill, glass-ish
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