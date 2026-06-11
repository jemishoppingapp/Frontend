#!/usr/bin/env bash
# dump-jemi-state.sh
#
# Collects everything I need to debug install-15 and writes it to a single
# file (jemi-state-dump.txt) you can open in Notepad and paste back to me.
#
# Reads nothing sensitive (.env.local secrets are masked).

set -u

OUT="jemi-state-dump.txt"

# Reset file
echo "JEMI STATE DUMP — $(date)" > "$OUT"
echo "Working directory: $(pwd)" >> "$OUT"
echo "" >> "$OUT"

# ----- Helper: print a labeled section
section() {
  echo "" >> "$OUT"
  echo "============================================================" >> "$OUT"
  echo "  $1" >> "$OUT"
  echo "============================================================" >> "$OUT"
}

# ----- Helper: dump a file if it exists, otherwise note missing
dump_file() {
  local path="$1"
  if [[ -f "$path" ]]; then
    echo "" >> "$OUT"
    echo "--- FILE: $path ---" >> "$OUT"
    cat "$path" >> "$OUT"
    echo "" >> "$OUT"
    echo "--- END $path ---" >> "$OUT"
  else
    echo "" >> "$OUT"
    echo "--- MISSING: $path ---" >> "$OUT"
  fi
}

# ----- 1. Find all paystack-related files (verify routes, init, webhook etc.)
section "1. Paystack route files (looking for verify, init, webhook)"
echo "" >> "$OUT"
echo "Searching for any files under app/api/ with 'paystack' or 'verify' in the path:" >> "$OUT"
find app/api -type f \( -name '*.ts' -o -name '*.tsx' \) 2>/dev/null | grep -iE 'paystack|verify' >> "$OUT" 2>/dev/null || echo "  (no matches)" >> "$OUT"

echo "" >> "$OUT"
echo "All files in app/api:" >> "$OUT"
find app/api -type f \( -name '*.ts' -o -name '*.tsx' \) 2>/dev/null | sort >> "$OUT"

# ----- 2. Dump the actual paystack verify route(s) — at every plausible path
section "2. Paystack verify route contents (every candidate path)"
for candidate in \
  "app/api/paystack/verify/route.ts" \
  "app/api/payments/paystack/verify/route.ts" \
  "app/api/paystack/route.ts" \
  "app/api/paystack/init/route.ts" \
  "app/api/paystack/webhook/route.ts" \
  "app/api/paystack/initialize/route.ts"; do
  dump_file "$candidate"
done

# ----- 3. Dump the orders schema definition so I can see column names
section "3. Orders table schema (looking for paymentReference column)"
echo "" >> "$OUT"
echo "Grep result for orders table definition in db/schema.ts:" >> "$OUT"
echo "" >> "$OUT"
if [[ -f "db/schema.ts" ]]; then
  # Print 60 lines starting from the orders table definition
  awk '/^export const orders = pgTable/,/^\}\)/' db/schema.ts | head -100 >> "$OUT"
  echo "" >> "$OUT"
  echo "  (above is the orders pgTable definition)" >> "$OUT"
else
  echo "  db/schema.ts MISSING" >> "$OUT"
fi

# ----- 4. Check actual Neon DB columns via drizzle introspection (if reachable)
section "4. Verifying schema actually pushed to Neon"
echo "" >> "$OUT"
echo "Attempting to list orders columns from Neon DB..." >> "$OUT"
echo "" >> "$OUT"
# We use psql if available via the DATABASE_URL
if command -v psql >/dev/null 2>&1; then
  if [[ -f ".env.local" ]]; then
    DBURL=$(grep -E "^DATABASE_URL=" .env.local | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")
    if [[ -n "$DBURL" ]]; then
      echo "Running psql query to list orders columns:" >> "$OUT"
      psql "$DBURL" -c "\d orders" >> "$OUT" 2>&1 || echo "  psql failed (network?)" >> "$OUT"
      echo "" >> "$OUT"
      echo "Checking if escrow_ledger table exists:" >> "$OUT"
      psql "$DBURL" -c "\d escrow_ledger" >> "$OUT" 2>&1 || echo "  escrow_ledger probably doesn't exist" >> "$OUT"
    else
      echo "  Could not extract DATABASE_URL from .env.local" >> "$OUT"
    fi
  fi
else
  echo "  psql not installed — skipping live DB check" >> "$OUT"
  echo "  (we'll verify via drizzle-kit pull later if needed)" >> "$OUT"
fi

# ----- 5. Show .env.local with secrets masked
section "5. .env.local (secrets masked)"
echo "" >> "$OUT"
if [[ -f ".env.local" ]]; then
  while IFS= read -r line; do
    # Mask anything after = on lines that look secret-ish
    if [[ "$line" =~ ^(DATABASE_URL|PAYSTACK_SECRET_KEY|JWT_SECRET|CRON_SECRET|CLOUDINARY_API_SECRET|RESEND_API_KEY)= ]]; then
      key="${line%%=*}"
      echo "${key}=********MASKED********" >> "$OUT"
    else
      echo "$line" >> "$OUT"
    fi
  done < .env.local
fi

# ----- 6. lib/escrow-server.ts current content (so we can see the broken paymentReference reference)
section "6. lib/escrow-server.ts (the file with the TypeScript error)"
dump_file "lib/escrow-server.ts"

# ----- 7. Current buyer order detail page
section "7. Buyer order detail page (to verify ConfirmReceiptButton placement)"
dump_file "app/(account)/orders/[orderNumber]/page.tsx"

# ----- 8. Quick file existence checklist
section "8. Critical file existence checklist"
echo "" >> "$OUT"
for f in \
  "lib/escrow.ts" \
  "lib/escrow-server.ts" \
  "lib/seller-session.ts" \
  "lib/session.ts" \
  "db/schema.ts" \
  "db/pool.ts" \
  "drizzle.config.ts" \
  "vercel.json" \
  "app/api/orders/[orderNumber]/confirm-receipt/route.ts" \
  "app/api/cron/escrow-jobs/route.ts" \
  "app/api/seller/escrow-summary/route.ts" \
  "app/api/admin/orders/[orderNumber]/refund/route.ts" \
  "app/seller/(authed)/page.tsx" \
  "app/admin/(authed)/orders/[orderNumber]/page.tsx" \
  "app/admin/(authed)/orders/[orderNumber]/AdminRefundButton.tsx" \
  "app/(account)/orders/[orderNumber]/page.tsx" \
  "app/(account)/orders/[orderNumber]/ConfirmReceiptButton.tsx"; do
  if [[ -f "$f" ]]; then
    echo "  EXISTS: $f" >> "$OUT"
  else
    echo "  MISSING: $f" >> "$OUT"
  fi
done

# ----- Summary
echo "" >> "$OUT"
echo "============================================================" >> "$OUT"
echo "DUMP COMPLETE" >> "$OUT"
echo "============================================================" >> "$OUT"
echo "" >> "$OUT"
echo "File saved to: $(pwd)/$OUT"
echo ""
echo "Now: open $OUT in Notepad, copy the entire contents, paste back to Claude."
echo ""
echo "Tip: you can open it in Notepad with this command:"
echo "  notepad $OUT"
