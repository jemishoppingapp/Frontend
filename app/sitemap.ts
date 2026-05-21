import type { MetadataRoute } from 'next';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/db';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
  { url: `${SITE_URL}/products`, changeFrequency: 'daily', priority: 0.9 },
  { url: `${SITE_URL}/products?category=fashion`, changeFrequency: 'daily', priority: 0.7 },
  { url: `${SITE_URL}/products?category=electronics`, changeFrequency: 'daily', priority: 0.7 },
  { url: `${SITE_URL}/products?category=food`, changeFrequency: 'daily', priority: 0.7 },
  { url: `${SITE_URL}/products?category=accessories`, changeFrequency: 'daily', priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const products = await db()
      .select({ slug: schema.products.slug, updatedAt: schema.products.updatedAt })
      .from(schema.products)
      .where(eq(schema.products.isActive, true));

    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

    return [...STATIC_ROUTES, ...productRoutes];
  } catch {
    return STATIC_ROUTES;
  }
}