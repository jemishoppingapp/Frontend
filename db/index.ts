/**
 * Postgres connection — Neon serverless driver.
 *
 * Why this driver: works in BOTH Node (Vercel functions) and Edge
 * (middleware). Uses HTTP fetch under the hood, so no persistent
 * connection pool to exhaust on Atlas's-style limits.
 *
 * The serverless driver does NOT need a connection pool config the way
 * Mongo did. Each query is an isolated HTTP request — Neon handles
 * connection management on their end.
 *
 * For transactions, use the websocket-pool variant (also from
 * @neondatabase/serverless). Drizzle's tx callback wraps this correctly.
 */
import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from './schema';

// Required for the HTTP driver to function in Node 18+ envs.
neonConfig.fetchConnectionCache = true;

// Lazy resolve so a missing DATABASE_URL doesn't crash module-load
// (Next.js evaluates this during `next build`). Same pattern as
// lib/auth.ts and lib/mongodb.ts.
function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not defined. Set it to your Neon connection string in .env.local.'
    );
  }
  return url;
}

// Lazy client — created on first use, then cached.
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (_db) return _db;
  const sql = neon(getConnectionString());
  _db = drizzle(sql, { schema });
  return _db;
}

/**
 * Convenience: re-exports the schema namespace so callers can write
 *   import { db, products } from '@/db';
 *   await db().select().from(products);
 */
export { schema };
export const db = getDb;