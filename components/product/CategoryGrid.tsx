import Link from 'next/link';
import { CategoryIcon } from '@/components/CategoryIcon';

const CATEGORIES = [
  { slug: 'fashion', name: 'Fashion', description: 'Clothes & shoes' },
  { slug: 'electronics', name: 'Electronics', description: 'Gadgets & tech' },
  { slug: 'food', name: 'Food & drinks', description: 'Snacks & beverages' },
  { slug: 'accessories', name: 'Accessories', description: 'Bags & wallets' },
];

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={`/products?category=${cat.slug}`}
          className="group bg-surface-1 hover:bg-surface-2 rounded-2xl p-5 sm:p-6 transition-colors border border-border-soft"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-surface flex items-center justify-center mb-4 border border-border-soft">
            <CategoryIcon slug={cat.slug} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <h3 className="font-display text-base sm:text-lg font-semibold text-fg group-hover:text-primary transition-colors">
            {cat.name}
          </h3>
          <p className="text-xs sm:text-sm text-fg-2 mt-1">{cat.description}</p>
        </Link>
      ))}
    </div>
  );
}