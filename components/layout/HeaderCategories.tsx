'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

/* Static category list — mirrors the four categories in
 * scripts/seed-categories.ts. We hard-code here (rather than fetching)
 * because the header renders on every page and shouldn't wait for a
 * DB roundtrip. When we add more categories or rename them, update
 * BOTH this file AND the seed script.
 *
 * If categories grow past ~8 items we'll switch this to fetch +
 * revalidate(3600).
 */
const CATEGORIES = [
  { slug: 'all', name: 'All' },
  { slug: 'fashion', name: 'Fashion', icon: '👕' },
  { slug: 'electronics', name: 'Electronics', icon: '🎧' },
  { slug: 'food', name: 'Food & Drinks', icon: '🍔' },
  { slug: 'accessories', name: 'Accessories', icon: '👜' },
];

export function HeaderCategories() {
  const pathname = usePathname();
  const params = useSearchParams();
  const activeCategory = params.get('category') ?? (pathname === '/products' ? 'all' : null);

  return (
    <nav
      aria-label="Categories"
      className="w-full overflow-x-auto scrollbar-none -mx-2 px-2"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <ul className="flex items-center gap-1 min-w-max">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.slug;
          const href = cat.slug === 'all' ? '/products' : `/products?category=${cat.slug}`;
          return (
            <li key={cat.slug}>
              <Link
                href={href}
                className={cn(
                  'inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                )}
              >
                {cat.icon && <span aria-hidden>{cat.icon}</span>}
                {cat.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}