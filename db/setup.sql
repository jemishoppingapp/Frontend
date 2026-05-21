-- Drizzle's typed API can declare a `text` column for search_vector,
-- but the actual TSVECTOR + trigger that keeps it in sync is plain SQL.
-- Run this AFTER `drizzle-kit push` (or include in your migration).
--
-- npm run db:setup  (added to package.json scripts)

-- 1. Convert search_vector column to TSVECTOR type if not already.
-- Idempotent: ALTER TABLE ... TYPE is a no-op if the type is already
-- correct (well, it errors — so we wrap in a DO block).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products'
      AND column_name = 'search_vector'
      AND data_type <> 'tsvector'
  ) THEN
    ALTER TABLE products
      ALTER COLUMN search_vector TYPE tsvector
      USING to_tsvector('english',
        coalesce(name, '') || ' ' ||
        coalesce(description, '') || ' ' ||
        coalesce(category, ''));
  END IF;
END $$;

-- 2. GIN index for fast full-text search.
CREATE INDEX IF NOT EXISTS products_search_vector_idx
  ON products USING GIN (search_vector);

-- 3. Trigger to keep search_vector in sync with name/description/category.
-- Weights: name (A) = highest, description (B) = medium, category (C) = lowest.
-- Matches the Mongo weights: name:10, description:5, category:1.
CREATE OR REPLACE FUNCTION products_search_vector_update()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.category, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_search_vector_trigger ON products;
CREATE TRIGGER products_search_vector_trigger
  BEFORE INSERT OR UPDATE OF name, description, category
  ON products
  FOR EACH ROW
  EXECUTE FUNCTION products_search_vector_update();

-- 4. Backfill any existing rows.
UPDATE products SET search_vector = search_vector WHERE search_vector IS NULL;