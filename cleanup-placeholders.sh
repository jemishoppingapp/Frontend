#!/usr/bin/env bash
# cleanup-placeholders.sh
#
# Soft-deletes (is_active=false) all products whose first image is a
# placehold.co placeholder URL. Order history is preserved — products
# are HIDDEN from buyers but not destroyed.
#
# Idempotent. Reversible by setting is_active=true again on those rows.

set -euo pipefail

if [[ -t 1 ]]; then
  C_RED=$'\033[31m'; C_GRN=$'\033[32m'; C_YEL=$'\033[33m'
  C_BLU=$'\033[34m'; C_DIM=$'\033[2m';  C_RST=$'\033[0m'
else
  C_RED=''; C_GRN=''; C_YEL=''; C_BLU=''; C_DIM=''; C_RST=''
fi
info() { echo "${C_BLU}ℹ${C_RST}  $*"; }
ok()   { echo "${C_GRN}✓${C_RST}  $*"; }
warn() { echo "${C_YEL}⚠${C_RST}  $*"; }
err()  { echo "${C_RED}✗${C_RST}  $*" >&2; }
step() { echo; echo "${C_BLU}▸${C_RST} ${1}"; }

# Sanity
if [[ ! -f "package.json" ]] || ! grep -F -q '"jemi"' package.json; then
  err "Run from jemi project root"
  exit 1
fi
if [[ ! -f ".env.local" ]]; then
  err ".env.local missing"
  exit 1
fi

step "Writing scripts/cleanup-placeholders.ts"
cat > scripts/cleanup-placeholders.ts <<'CLEANUP_TS'
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
CLEANUP_TS
ok "scripts/cleanup-placeholders.ts written"

# Add npm script if missing (using dotenv-cli, not the python dotenv that bit us before)
step "Adding npm script 'db:cleanup-placeholders'"
if grep -F -q '"db:cleanup-placeholders"' package.json; then
  info "already exists"
else
  node - <<'NODE_PATCH'
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
p.scripts = p.scripts || {};
p.scripts['db:cleanup-placeholders'] = 'dotenv-cli -e .env.local -- tsx scripts/cleanup-placeholders.ts';
fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n');
console.log('  added db:cleanup-placeholders');
NODE_PATCH
  ok "added"
fi

step "Running cleanup"
warn "About to soft-delete all products with placehold.co images."
warn "They will be HIDDEN from buyers but NOT deleted from the database."
warn "You can restore later via SQL if needed."
echo "    Proceed? [Y/n] "
read -r CONFIRM
CONFIRM="${CONFIRM:-Y}"
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  err "Aborted."
  exit 1
fi

if npx --no dotenv-cli -e .env.local -- npx --no tsx scripts/cleanup-placeholders.ts; then
  echo
  ok "${C_GRN}Cleanup complete.${C_RST}"
  echo
  echo "  Next steps:"
  echo "    1. Visit your live site / restart dev"
  echo "    2. /products should now be empty (until you add real products)"
  echo "    3. Add real products via /admin/products/new"
  echo
  echo "  If you accidentally hid something you wanted to keep, run in Neon SQL:"
  echo "    UPDATE products SET is_active = true WHERE name = 'Your Product Name';"
else
  err "cleanup failed"
  exit 1
fi
