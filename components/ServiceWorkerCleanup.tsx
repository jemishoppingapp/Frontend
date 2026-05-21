'use client';

import { useEffect } from 'react';

/**
 * ServiceWorkerCleanup — self-destructing service worker registration.
 *
 * The Vite-era Jemi (and many PWAs before it) shipped a service worker
 * that cached aggressively. When a returning visitor lands on the new
 * Next.js app, their browser is still serving old cached HTML/JS from
 * the SW, which means they see the OLD APP until they manually
 * uninstall the worker — which they will never do.
 *
 * Our /sw.js (in /public) unregisters itself and clears all caches on
 * activate. This component just triggers the registration so the new
 * SW takes over and immediately self-destructs.
 *
 * After ~1 month in production, we can remove this entirely — by then
 * all returning visitors will have run the cleanup at least once.
 */
export function ServiceWorkerCleanup() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
    // Only register if there's already a service worker (or one was
    // registered for this origin in the past — we can't directly detect
    // that, but if `getRegistrations` returns anything, that's a signal).
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => {
        if (regs.length === 0) {
          // No existing SW — don't register a fresh one just to delete it.
          return;
        }
        navigator.serviceWorker.register('/sw.js').catch(() => {
          // Network error or SW path missing — silently swallow.
        });
      })
      .catch(() => {
        // Older browsers without getRegistrations — skip.
      });
  }, []);

  return null;
}