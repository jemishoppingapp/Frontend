'use client';

import { useEffect } from 'react';
import { BrandedFallback } from '@/components/BrandedFallback';

/**
 * Route-level error boundary. Triggered when a Server Component throws
 * during rendering. Reset re-runs the segment.
 *
 * For diagnostics, errors are logged to the console — wire this up to
 * Sentry / similar later if needed. Don't log PII; the error object
 * itself is fine.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[route error]', error);
  }, [error]);

  return <BrandedFallback variant="error" reset={reset} />;
}