import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Pagination — prev/next + numbered links. URL-driven so each page is
 * crawlable and shareable.
 *
 * Compact layout: shows page 1, prev, current, next, last when there
 * are many pages, with "…" gaps. Keeps tap targets at 44×44 on mobile.
 */
function buildPageList(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

export function ProductPagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function buildHref(page: number): string {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v) params.set(k, v);
    }
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ''}`;
  }

  const pages = buildPageList(currentPage, totalPages);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 sm:gap-2">
      {/* Prev */}
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="tap inline-flex items-center justify-center h-10 w-10 rounded-md border border-border text-gray-700 hover:bg-gray-50 transition-colors"
          aria-label="Previous page"
          rel="prev"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-border-soft text-gray-300">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {/* Page numbers */}
      {pages.map((p, idx) =>
        p === 'ellipsis' ? (
          <span
            key={`e-${idx}`}
            className="inline-flex items-center justify-center h-10 w-8 text-gray-400 text-sm"
            aria-hidden
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={cn(
              'tap inline-flex items-center justify-center h-10 min-w-10 px-2 rounded-md text-sm font-medium transition-colors',
              p === currentPage
                ? 'bg-primary text-primary-foreground'
                : 'border border-border text-gray-700 hover:bg-gray-50'
            )}
          >
            {p}
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="tap inline-flex items-center justify-center h-10 w-10 rounded-md border border-border text-gray-700 hover:bg-gray-50 transition-colors"
          aria-label="Next page"
          rel="next"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-border-soft text-gray-300">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}