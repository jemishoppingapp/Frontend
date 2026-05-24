'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { slug: 'all', name: 'All' },
  { slug: 'fashion', name: 'Fashion' },
  { slug: 'electronics', name: 'Electronics' },
  { slug: 'food', name: 'Food & Drinks' },
  { slug: 'accessories', name: 'Accessories' },
];

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A-Z' },
];

export function ProductFilters({
  activeCategory,
  activeSort,
}: {
  activeCategory: string;
  activeSort: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  function makeHref(cat: string): string {
    const sp = new URLSearchParams(params.toString());
    if (cat === 'all') sp.delete('category');
    else sp.set('category', cat);
    sp.delete('page');
    return `/products?${sp.toString()}`;
  }

  function handleSortChange(value: string) {
    const sp = new URLSearchParams(params.toString());
    if (value === 'newest') sp.delete('sort');
    else sp.set('sort', value);
    sp.delete('page');
    router.push(`/products?${sp.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
        {CATEGORIES.map((c) => {
          const active = c.slug === activeCategory;
          return (
            <Link
              key={c.slug}
              href={makeHref(c.slug)}
              className={cn(
                'tap shrink-0 inline-flex items-center px-4 h-9 rounded-full text-sm font-medium transition-colors border',
                active
                  ? 'bg-fg text-fg-inverse border-fg'
                  : 'bg-transparent text-fg-2 border-border hover:bg-surface-1'
              )}
            >
              {c.name}
            </Link>
          );
        })}
      </div>

      <select
        value={activeSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="bg-surface border border-border text-fg text-sm rounded-full h-9 px-4 pr-8 outline-none focus:ring-2 focus:ring-primary"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
  );
}