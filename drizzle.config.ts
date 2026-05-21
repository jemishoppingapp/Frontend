import type { Config } from 'drizzle-kit';

/**
 * Drizzle Kit config — used by `npm run db:push`, `db:generate`,
 * `db:migrate`, `db:studio`.
 *
 * For dev iteration use `db:push` (sync schema directly).
 * Before production deploy, switch to generated migrations:
 *   npm run db:generate   (creates SQL files in db/migrations/)
 *   npm run db:migrate    (applies them)
 */
export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;