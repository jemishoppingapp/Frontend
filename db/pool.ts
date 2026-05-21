/**
 * WebSocket-based Postgres client for transactional queries.
 *
 * Why this exists alongside db/index.ts (HTTP driver):
 * - db/index.ts uses neon-http: fast, edge-compatible, ONE shot per
 *   query, NO transaction support. Throws at runtime if you call
 *   db.transaction().
 * - db/pool.ts uses @neondatabase/serverless's Pool (WebSocket): real
 *   Postgres protocol over a persistent connection, supports
 *   db.transaction(async (tx) => { ... }), supports SELECT FOR UPDATE
 *   read-modify-write inside transactions.
 *
 * Use this ONLY in the API routes that need transactions:
 *   - /api/payment/initialize  (reserve inventory + create order)
 *   - /api/payment/verify      (mark paid + decrement stock idempotently)
 *   - /api/payment/webhook     (same logic as verify, idempotent)
 *
 * Everything else (homepage, product list, product detail) stays on
 * db/index.ts (HTTP) for lower per-request latency.
 */
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import * as schema from './schema';

// In Node, the WebSocket constructor needs to come from the `ws` package.
// Vercel's Node runtime has `WebSocket` globally available (Node 22+),
// so we don't need to install `ws`. If you ever deploy to a Node < 18.18
// environment, install `ws` and uncomment the next two lines.
// import ws from 'ws';
// neonConfig.webSocketConstructor = ws;

// Edge runtimes (middleware) already have WebSocket. No action needed.

// Cache the pool across hot reloads in dev.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForPool = global as unknown as { pgPool?: Pool };

function getPool(): Pool {
  if (globalForPool.pgPool) return globalForPool.pgPool;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not defined. Set it to your Neon connection string in .env.local.'
    );
  }
  globalForPool.pgPool = new Pool({ connectionString: url });
  return globalForPool.pgPool;
}

let _dbPool: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function dbPool() {
  if (_dbPool) return _dbPool;
  _dbPool = drizzle(getPool(), { schema });
  return _dbPool;
}