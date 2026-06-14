# JEMI

Campus marketplace for Lagos State University. Students order online and
pick up at either campus gate. Sellers list products, hand over at the
gate, and get paid after the buyer confirms receipt.

Live: managed on Vercel. Database on Neon (Frankfurt).

## Stack

- Next.js 15 (App Router) + React 19, TypeScript
- Tailwind CSS 4
- Postgres on Neon, Drizzle ORM
- Paystack (payments, refunds)
- Cloudinary (product images)
- Auth: email + password, bcrypt, JWT cookie (jose)

## Getting started

```bash
git clone <repo-url>
cd jemi-frontend
npm install
cp .env.example .env.local   # then fill in real values
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Key | What it is |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string |
| `JWT_SECRET` | Signs the auth cookie. `openssl rand -base64 32` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name |
| `CLOUDINARY_API_KEY` | Cloudinary key |
| `CLOUDINARY_API_SECRET` | Cloudinary secret |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Same cloud name, exposed to the browser uploader |
| `PAYSTACK_SECRET_KEY` | Paystack secret (sk_test_ in dev) |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL |
| `CRON_SECRET` | Bearer token for `/api/cron/*`. Must also be set in Vercel |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` | First admin account for `npm run seed:admin` |

## Useful scripts

```bash
npm run dev            # local dev server
npm run build          # production build (run before pushing)
npm run typecheck      # tsc --noEmit
npm run db:push        # sync db/schema.ts to Neon (read prompts carefully)
npm run db:studio      # browse the database
npm run seed:admin     # create the first admin user
```

Careful with `db:push`: if drizzle-kit warns about data loss or wants to
alter `search_vector`, stop and review. `scripts/restore-search-vector.ts`
rebuilds the search column if it gets clobbered.

## How the money flows

1. Buyer pays through Paystack. The full amount lands in the JEMI account
   and a `hold` row is written to `escrow_ledger` for each seller in the
   order (done in both the verify endpoint and the webhook).
2. At the gate the seller taps **Mark delivered**, the buyer taps
   **Confirm receipt**. Buyer confirmation releases the money:
   `release` and `platform_fee` (5%) rows are written, order completes.
3. Timers (hourly cron at `/api/cron/escrow-jobs`):
   - 7 days, every seller marked delivered, buyer silent: auto-release.
   - 7 days, nobody marked delivered: auto-cancel + Paystack refund.
   - 14 days, some delivered and some not: flagged `awaiting_review`
     for an admin to resolve by hand.
4. Payouts are manual bank transfers, weekly or monthly per seller
   (admin tooling for this is the next build).

A seller's available balance is `sum(release) - sum(payout)` over their
ledger rows. The ledger is append-only; never update or delete rows.

## Project layout

```
app/(public)     storefront: home, products, cart
app/(auth)       login, register
app/(account)    buyer profile + orders
app/checkout     checkout + Paystack verify
app/admin        admin panel (light mode, own login)
app/seller       seller dashboard (light mode)
app/sellers      public seller application + pending page
app/api          route handlers
components       shared UI
db               Drizzle schema + clients (http + websocket pool)
lib              auth, sessions, escrow, paystack, checkout logic
scripts          seeds + one-off maintenance
```

Two database clients on purpose: `db/index.ts` (HTTP, fast, no
transactions) for reads, `db/pool.ts` (WebSocket) for anything that needs
`transaction()` or `SELECT ... FOR UPDATE` — checkout, payment verify,
escrow release, mark-delivered.

## Deploying

Push to `main`; Vercel builds and deploys. Before the first deploy with
cron jobs, add `CRON_SECRET` to Vercel environment variables (all three
environments), or `/api/cron/escrow-jobs` returns 403. Cron schedules
live in `vercel.json`.