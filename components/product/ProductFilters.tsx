'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';
import { LayoutGrid } from 'lucide-react';
import { CategoryIcon } from '@/components/CategoryIcon';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { slug: 'all', name: 'All' },
  { slug: 'fashion', name: 'Fashion' },
  { slug: 'electronics', name: 'Electronics' },
  { slug: 'food', name: 'Food & Drinks' },
  { slug: 'accessories', name: 'Accessories' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name-asc', label: 'Name: A to Z' },
];

/**
 * Filters bar above the product grid. Category pills scroll horizontally
 * on mobile, sort is a native <select> (which gives us OS-native UI on
 * iOS and Android — no need to build a fancy combobox for cheap phones).
 *
 * URL-driven: changes navigate to the same path with updated query
 * params. That makes results crawlable, bookmarkable, deep-linkable.
 */
export function ProductFilters({
  activeCategory,
  activeSort,
}: {
  activeCategory: string;
  activeSort: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  function changeSort(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === 'newest') {
      next.delete('sort');
    } else {
      next.set('sort', value);
    }
    next.delete('page');  // reset to page 1 on sort change
    const qs = next.toString();
    router.push(`/products${qs ? `?${qs}` : ''}`);
  }

  // Build category href that preserves search query (if any).
  function categoryHref(slug: string) {
    const next = new URLSearchParams(params.toString());
    if (slug === 'all') {
      next.delete('category');
    } else {
      next.set('category', slug);
    }
    next.delete('page');
    const qs = next.toString();
    return `/products${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      {/* Category pills — horizontal scroll on mobile */}
      <nav
        aria-label="Filter by category"
        className="flex-1 overflow-x-auto -mx-2 px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <ul className="flex items-center gap-2 min-w-max">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <li key={cat.slug}>
                <Link
                  href={categoryHref(cat.slug)}
                  className={cn(
                    'inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors border',
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-white text-gray-700 border-border hover:border-primary hover:text-primary'
                  )}
                >
                  {cat.slug === 'all' ? (
                    <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                    <CategoryIcon slug={cat.slug} className="h-3.5 w-3.5" />
                  )}
                  {cat.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sort — native select for OS-native UX */}
      <div className="relative shrink-0">
        <label className="sr-only" htmlFor="sort-select">Sort by</label>
        <ArrowUpDown
          className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500 pointer-events-none"
          aria-hidden
        />
        <select
          id="sort-select"
          value={activeSort}
          onChange={(e) => changeSort(e.target.value)}
          className="appearance-none h-9 pl-8 pr-8 rounded-full text-xs sm:text-sm font-medium bg-white text-gray-700 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom chevron */}
        <svg
          className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}