import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProductPagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const makeHref = (page: number): string => {
    const sp = new URLSearchParams();
    if (searchParams) {
      Object.entries(searchParams).forEach(([k, v]) => {
        if (v && v !== 'all') sp.set(k, v);
      });
    }
    if (page > 1) sp.set('page', String(page));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const PageLink = ({ page, children, disabled }: { page: number; children: React.ReactNode; disabled?: boolean }) => (
    disabled ? (
      <span className="tap inline-flex items-center justify-center min-w-9 h-9 px-2 rounded-md text-fg-3">
        {children}
      </span>
    ) : (
      <Link
        href={makeHref(page)}
        className={cn(
          'tap inline-flex items-center justify-center min-w-9 h-9 px-2 rounded-md text-sm font-medium transition-colors',
          page === currentPage
            ? 'bg-fg text-fg-inverse'
            : 'text-fg-2 hover:bg-surface-1 hover:text-fg'
        )}
      >
        {children}
      </Link>
    )
  );

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      <PageLink page={currentPage - 1} disabled={currentPage === 1}>
        <ChevronLeft className="h-4 w-4" />
      </PageLink>
      {Array.from({ length: totalPages }).map((_, i) => (
        <PageLink key={i + 1} page={i + 1}>{i + 1}</PageLink>
      ))}
      <PageLink page={currentPage + 1} disabled={currentPage === totalPages}>
        <ChevronRight className="h-4 w-4" />
      </PageLink>
    </nav>
  );
}