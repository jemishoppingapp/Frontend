/**
 * Restore products.search_vector to its proper tsvector type with
 * weighted GIN index and auto-update trigger.
 *
 * Drizzle's schema introspection reads our tsvector column as text
 * (because Drizzle doesn't model tsvector natively) and on push
 * "corrects" it back to text, wiping the column. We rebuild it here
 * via raw SQL.
 */
import { sql } from 'drizzle-orm';
import { db } from '@/db';

async function run() {
  console.log('1. Drop the existing search_vector column (currently text) ...');
  await db().execute(sql`ALTER TABLE products DROP COLUMN IF EXISTS search_vector`);

  console.log('2. Re-add as tsvector ...');
  await db().execute(sql`
    ALTER TABLE products
    ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
      setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(category, '')), 'C')
    ) STORED
  `);

  console.log('3. Rebuild GIN index ...');
  await db().execute(sql`
    CREATE INDEX IF NOT EXISTS products_search_vector_idx
    ON products USING GIN (search_vector)
  `);

  console.log('Done.');
}

run().catch((err) => {
  console.error('restore-search-vector failed:', err);
  process.exit(1);
});
