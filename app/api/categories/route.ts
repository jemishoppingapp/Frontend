import { NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db, schema } from '@/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/categories — public, all categories, sorted by displayOrder.
 */
export async function GET() {
  try {
    const rows = await db()
      .select()
      .from(schema.categories)
      .orderBy(asc(schema.categories.displayOrder), asc(schema.categories.name));
    return NextResponse.json({ categories: rows });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api/categories]', err);
    return NextResponse.json(
      { categories: [], error: 'Unable to fetch categories' },
      { status: 500 }
    );
  }
}