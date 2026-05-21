import Link from 'next/link';

/**
 * Compact category grid for the homepage. Static — mirrors the
 * categories in HeaderCategories. If you change the list, update both.
 */
const CATEGORIES = [
  { slug: 'fashion', name: 'Fashion', icon: '👕', description: 'Clothes & Shoes' },
  { slug: 'electronics', name: 'Electronics', icon: '🎧', description: 'Gadgets & Tech' },
  { slug: 'food', name: 'Food & Drinks', icon: '🍔', description: 'Snacks & Beverages' },
  { slug: 'accessories', name: 'Accessories', icon: '👜', description: 'Bags & Wallets' },
];

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={`/products?category=${cat.slug}`}
          className="group flex flex-col items-center p-3 sm:p-4 bg-surface-muted rounded-lg hover:bg-primary-light transition-colors text-center"
        >
          <div className="text-2xl sm:text-3xl mb-1 sm:mb-2" aria-hidden>
            {cat.icon}
          </div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-primary-dark transition-colors">
            {cat.name}
          </h3>
          <p className="hidden sm:block text-[10px] text-gray-500 mt-0.5">
            {cat.description}
          </p>
        </Link>
      ))}
    </div>
  );
}