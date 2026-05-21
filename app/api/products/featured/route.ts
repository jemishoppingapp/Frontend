import { NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { db, schema } from '@/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/products/featured?limit=8 — active, featured, newest first.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') ?? 8), 1), 24);

  try {
    const rows = await db()
      .select()
      .from(schema.products)
      .where(and(eq(schema.products.isActive, true), eq(schema.products.isFeatured, true)))
      .orderBy(desc(schema.products.createdAt))
      .limit(limit);
    return NextResponse.json({ products: rows });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api/products/featured]', err);
    return NextResponse.json(
      { products: [], error: 'Unable to fetch products' },
      { status: 500 }
    );
  }
}