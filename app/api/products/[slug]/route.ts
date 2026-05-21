import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db, schema } from '@/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const rows = await db()
      .select()
      .from(schema.products)
      .where(and(eq(schema.products.slug, slug), eq(schema.products.isActive, true)))
      .limit(1);
    const product = rows[0];
    if (!product) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api/products/slug]', err);
    return NextResponse.json({ error: 'Unable to fetch product' }, { status: 500 });
  }
}