import { asc } from 'drizzle-orm';
import { db, schema } from '@/db';
import { ok, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return withErrorHandling(async () => {
    const rows = await db()
      .select()
      .from(schema.categories)
      .orderBy(asc(schema.categories.displayOrder), asc(schema.categories.name));
    return ok({ categories: rows });
  });
}