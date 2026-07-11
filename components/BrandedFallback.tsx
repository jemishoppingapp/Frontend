import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Container } from './Container';

/**
 * BrandedFallback — single component, four variants.
 *
 * Used as the body of:
 *   app/loading.tsx       variant="loading"
 *   app/error.tsx         variant="error"
 *   app/not-found.tsx     variant="404"
 *   app/offline/page.tsx  variant="offline"
 *
 * Reason it's one component: keeps the visual identity consistent
 * across every "something's wrong / not ready" state. If you change
 * the brand mark or the layout, it changes everywhere at once.
 *
 * No white screens. No "Application error" raw text. No generic 404.
 */

export type FallbackVariant = 'loading' | 'error' | '404' | 'offline';

type Props = {
  variant: FallbackVariant;
  title?: string;
  message?: string;
  /** Optional callback for the "try again" button on error variants */
  reset?: () => void;
};

const defaults: Record<FallbackVariant, { title: string; message: string }> = {
  loading: {
    title: 'Loading…',
    message: 'Just a moment.',
  },
  error: {
    title: 'Something went wrong',
    message: 'We hit an unexpected issue. Try again, or head back home.',
  },
  '404': {
    title: 'Page not found',
    message: "We couldn't find what you were looking for. It may have moved.",
  },
  offline: {
    title: "You're offline",
    message: 'Check your connection and try again. Some pages may still work from cache.',
  },
};

export function BrandedFallback({ variant, title, message, reset }: Props) {
  const { title: defaultTitle, message: defaultMessage } = defaults[variant];
  const finalTitle = title ?? defaultTitle;
  const finalMessage = message ?? defaultMessage;

  return (
    <Container
      size="narrow"
      className="min-h-[60vh] flex items-center justify-center py-12"
    >
      <div className="text-center">
        {/* Brand mark — JEMI wordmark */}
        <div className="mb-6 inline-flex items-center justify-center">
          <span className="text-3xl font-bold tracking-tight text-primary">
            JEMI
          </span>
        </div>

        {/* Status indicator — visual cue per variant */}
        <div className={cn('mb-4 inline-flex', variant === 'loading' && 'animate-pulse')}>
          {variant === 'loading' && (
            <div className="h-12 w-12 rounded-full border-4 border-primary-light border-t-primary animate-spin" />
          )}
          {variant === 'error' && (
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          )}
          {variant === '404' && (
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
          )}
          {variant === 'offline' && (
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-yellow-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121zM12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z" />
              </svg>
            </div>
          )}
        </div>

        <h1 className="text-xl font-semibold text-fg mb-2">
          {finalTitle}
        </h1>
        <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
          {finalMessage}
        </p>

        {/* Actions vary by variant */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {(variant === 'error' || variant === 'offline') && reset && (
            <button
              type="button"
              onClick={reset}
              className="tap inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              Try again
            </button>
          )}
          <Link
            href="/"
            className="tap inline-flex items-center px-4 py-2 rounded-md border border-border text-sm font-medium text-gray-700 hover:bg-surface-muted transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </Container>
  );
}