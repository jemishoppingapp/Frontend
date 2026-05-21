/**
 * Idempotent seed: 4 starter categories. Upsert by slug.
 *
 * Usage:
 *   npm run seed:categories
 */
import { db, schema } from '@/db';

const CATEGORIES = [
  { slug: 'fashion', name: 'Fashion', description: 'Clothes & Shoes', icon: 'Shirt', displayOrder: 10 },
  { slug: 'electronics', name: 'Electronics', description: 'Gadgets & Tech', icon: 'Headphones', displayOrder: 20 },
  { slug: 'food', name: 'Food & Drinks', description: 'Snacks & Beverages', icon: 'UtensilsCrossed', displayOrder: 30 },
  { slug: 'accessories', name: 'Accessories', description: 'Bags & Wallets', icon: 'ShoppingBag', displayOrder: 40 },
];

async function main() {
  for (const cat of CATEGORIES) {
    await db()
      .insert(schema.categories)
      .values(cat)
      .onConflictDoUpdate({
        target: schema.categories.slug,
        set: {
          name: cat.name,
          description: cat.description,
          icon: cat.icon,
          displayOrder: cat.displayOrder,
          updatedAt: new Date(),
        },
      });
    // eslint-disable-next-line no-console
    console.log(`  ✓ ${cat.slug.padEnd(15)} ${cat.name}`);
  }
  // eslint-disable-next-line no-console
  console.log(`Seeded ${CATEGORIES.length} categories.`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  process.exit(1);
});