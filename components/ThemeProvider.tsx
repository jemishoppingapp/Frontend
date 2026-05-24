'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'jemi-theme';

/**
 * ThemeProvider — manages light/dark state, persists to localStorage.
 * Dark is the default for first-time visitors. System preference is
 * IGNORED (brand consistency over OS-matching).
 *
 * The actual className manipulation on <html> happens via the inline
 * script in app/layout.tsx so it runs BEFORE first paint. This
 * provider just keeps the React state in sync.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  // On mount, read the current state (set by the no-FOWT script)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const isDark = document.documentElement.classList.contains('dark');
    setThemeState(isDark ? 'dark' : 'light');
  }, []);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    if (typeof document !== 'undefined') {
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // localStorage may be disabled (incognito + strict)
      }
    }
  };

  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Allow usage outside provider in dev tooling — return a no-op
    return { theme: 'dark', toggle: () => {}, setTheme: () => {} };
  }
  return ctx;
}