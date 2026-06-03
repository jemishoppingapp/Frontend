/**
 * Hide all products whose first image is a placehold.co URL.
 *
 * Uses raw SQL with a jsonb path query to match any product whose
 * `images` array contains at least one entry whose `url` starts with
 * https://placehold.co — those are the 24 seed products.
 *
 * Idempotent: setting is_active=false on already-hidden rows is a no-op.
 */
import { sql } from 'drizzle-orm';
import { db } from '@/db';

async function run() {
  // First: count what we'd hide (dry-run-ish — non-destructive read)
  const previewRows = await db().execute(sql`
    SELECT id, name FROM products
    WHERE is_active = true
      AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(images) AS img
        WHERE img->>'url' LIKE 'https://placehold.co%'
      )
    ORDER BY name
  `);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = previewRows.rows as Array<{ id: string; name: string }>;

  if (products.length === 0) {
    console.log('No placeholder products to hide. (Already cleaned up?)');
    return;
  }

  console.log(`Found ${products.length} active products with placehold.co images:`);
  for (const p of products) {
    console.log(`  - ${p.name}`);
  }
  console.log('');
  console.log('Hiding them (setting is_active=false)...');

  const result = await db().execute(sql`
    UPDATE products
    SET is_active = false, updated_at = now()
    WHERE is_active = true
      AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(images) AS img
        WHERE img->>'url' LIKE 'https://placehold.co%'
      )
  `);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const affected = (result as any).rowCount ?? products.length;
  console.log(`Hidden ${affected} products.`);
  console.log('');
  console.log('They are still in the database (preserves order history if any).');
  console.log('To restore later: UPDATE products SET is_active = true WHERE ...');
}

run().catch((err) => {
  console.error('cleanup-placeholders failed:', err);
  process.exit(1);
});
