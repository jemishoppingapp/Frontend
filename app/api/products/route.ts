import { and, asc, desc, eq, sql, type SQL } from 'drizzle-orm';
import { db, schema } from '@/db';
import { ok, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PAGE_SIZE = 24;

export async function GET(req: Request) {
  return withErrorHandling(async () => {
    const url = new URL(req.url);
    const q = url.searchParams.get('q')?.trim() || undefined;
    const category = url.searchParams.get('category') || undefined;
    const sort = url.searchParams.get('sort') || 'newest';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);

    const conditions = [eq(schema.products.isActive, true)];
    if (category && category !== 'all') {
      conditions.push(eq(schema.products.category, category));
    }

    let tsqueryExpr: SQL | undefined;
    if (q) {
      tsqueryExpr = sql`${schema.products.searchVector}::tsvector @@ plainto_tsquery('english', ${q})`;
    }

    let orderBy: SQL[];
    if (q && sort === 'newest') {
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
      db().select().from(schema.products).where(where).orderBy(...orderBy).limit(PAGE_SIZE).offset(skip),
      db().select({ count: sql<number>`count(*)::int` }).from(schema.products).where(where),
    ]);

    const total = totalRows[0]?.count ?? 0;
    return ok({
      products: productsRows,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    });
  });
}