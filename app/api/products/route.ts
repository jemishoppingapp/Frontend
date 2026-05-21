import { NextResponse } from 'next/server';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { db, schema } from '@/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PAGE_SIZE = 24;

/**
 * GET /api/products?q=&category=&sort=&page=
 *
 * Search uses Postgres `tsquery` against the `search_vector` GIN index
 * (configured in db/setup.sql). Ranking via ts_rank_cd.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim() || undefined;
  const category = url.searchParams.get('category') || undefined;
  const sort = url.searchParams.get('sort') || 'newest';
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);

  try {
    // Build the WHERE filter
    const conditions = [eq(schema.products.isActive, true)];
    if (category && category !== 'all') {
      conditions.push(eq(schema.products.category, category));
    }

    // Search: convert q into a plain-text tsquery. plainto_tsquery() handles
    // user input safely (no parsing errors for weird input like "hello!").
    let tsqueryExpr: SQL | undefined;
    if (q) {
      tsqueryExpr = sql`${schema.products.searchVector}::tsvector @@ plainto_tsquery('english', ${q})`;
    }

    // Sort
    let orderBy: SQL[];
    if (q && sort === 'newest') {
      // Default sort under search = relevance, then recency
      orderBy = [
        sql`ts_rank_cd(${schema.products.searchVector}::tsvector, plainto_tsquery('english', ${q})) DESC`,
        desc(schema.products.createdAt),
      ];
    } else if (sort === 'price-asc') {
      orderBy = [asc(schema.products.price)];
    } else if (sort === 'price-desc') {
      orderBy = [desc(schema.products.price)];
    } else if (sort === 'name-asc') {
      orderBy = [asc(schema.products.name)];
    } else {
      orderBy = [desc(schema.products.createdAt)];
    }

    const where = tsqueryExpr ? and(...conditions, tsqueryExpr) : and(...conditions);
    const skip = (page - 1) * PAGE_SIZE;

    const [productsRows, totalRows] = await Promise.all([
      db()
        .select()
        .from(schema.products)
        .where(where)
        .orderBy(...orderBy)
        .limit(PAGE_SIZE)
        .offset(skip),
      db()
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.products)
        .where(where),
    ]);

    const total = totalRows[0]?.count ?? 0;
    return NextResponse.json({
      products: productsRows,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api/products]', err);
    return NextResponse.json(
      { products: [], total: 0, error: 'Unable to fetch products' },
      { status: 500 }
    );
  }
}