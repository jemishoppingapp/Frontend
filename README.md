# JEMI

LASU campus marketplace. Next.js 15 + MongoDB + Paystack + Cloudinary.

## Quick start

```bash
cp .env.example .env.local
# fill in MONGODB_URI, JWT_SECRET, CLOUDINARY_*, PAYSTACK_*
npm install
npm run dev
```

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind v4 (`@tailwindcss/postcss`)
- MongoDB + Mongoose (cached connection pattern)
- jose JWT in httpOnly cookies
- Cloudinary for images, next/image for delivery
- Paystack for payments (test keys → live before launch)
- Vercel Free tier deploy target (region: fra1)

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run typecheck` — TS without emit
- `npm run seed:admin` — create the first admin user (uses SEED_ADMIN_* from .env.local)
- `npm run seed:products` — seed initial products (lands in install-4b)

## Project structure

```
app/                  Next.js routes (App Router)
  (authed)/           Auth-gated route group, layouts call requireAuth()
  api/                Route handlers (auth, products, cart, payment, webhook)
lib/                  mongodb, auth, cookies, session, cloudinary, paystack
models/               Mongoose models (User, Product, Category, Order, Cart)
components/           UI components (ui/ primitives, layout/, product/, cart/)
scripts/              One-off scripts (seed-admin, seed-products)
public/               Static assets (logos, manifests, favicons)
.legacy-jemi/         Archived Vite source (NOT committed)
```

## Notes

- pnpm-lock.yaml and yarn.lock are gitignored. Only commit package-lock.json.
- Vercel function body limit on Free tier is 4.5MB — keep image uploads
  client-side direct to Cloudinary, never proxy through API routes.
- LASU campus only: delivery zones are LASU Iba Gate and Iyana Iba Gate.