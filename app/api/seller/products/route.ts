import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@/db';
import { requireSeller } from '@/lib/seller-session';
import { ok, fail, failValidation, withErrorHandling } from '@/lib/api';
import { notifyOps } from '@/lib/notify';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const imageSchema = z.object({
  url: z.string().trim().url(),
  publicId: z.string().trim().max(200),
  alt: z.string().trim().max(200),
});

const createSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and dashes.'),
  description: z.string().trim().max(5000).default(''),
  price: z.number().min(0),
  marginPercent: z.number().min(0).max(100).optional(),
  originalPrice: z.number().min(0).nullable().optional(),
  category: z.enum(['fashion', 'electronics', 'food', 'accessories']),
  stockQuantity: z.number().int().min(0),
  isActive: z.boolean().default(true),
  features: z.array(z.string().trim().max(200)).default([]),
  images: z.array(imageSchema).min(1, 'At least one image is required.').max(5),
});

export async function POST(req: Request) {
  return withErrorHandling(async () => {
    const { seller } = await requireSeller();

    let parsed: z.infer<typeof createSchema>;
    try {
      const body = await req.json();
      parsed = createSchema.parse(body);
    } catch (err) {
      if (err instanceof z.ZodError) return failValidation(err);
      return fail('VALIDATION_ERROR', 'Invalid input.');
    }

    // Category restriction: if seller's declared category is specific (not 'other'),
    // they can only list in that category.
    if (
      seller.businessTypeCategory !== 'other' &&
      parsed.category !== seller.businessTypeCategory
    ) {
      return fail(
        'VALIDATION_ERROR',
        `You can only list in the "${seller.businessTypeCategory}" category. Contact admin to change.`,
        'category'
      );
    }

    // Slug uniqueness
    const existing = await db().select({ id: schema.products.id })
      .from(schema.products).where(eq(schema.products.slug, parsed.slug)).limit(1);
    if (existing.length > 0) {
      return fail('VALIDATION_ERROR', `Slug "${parsed.slug}" is already taken. Try another.`, 'slug');
    }

    await db().insert(schema.products).values({
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
      price: String(parsed.price),
      marginPercent: String(parsed.marginPercent ?? 5),
      originalPrice: parsed.originalPrice ? String(parsed.originalPrice) : null,
      category: parsed.category,
      seller: seller.businessName, // legacy text field — populated for compat
      sellerId: seller.id,
      stockQuantity: parsed.stockQuantity,
      inStock: parsed.stockQuantity > 0,
      isActive: parsed.isActive,
      isFeatured: false, // sellers can't self-promote to featured
      features: parsed.features.filter((f) => f.trim().length > 0),
      images: parsed.images,
      rating: '0',
      reviewCount: 0,
    });

    const created = await db().select({ id: schema.products.id, slug: schema.products.slug })
      .from(schema.products).where(eq(schema.products.slug, parsed.slug)).limit(1);
    try {
      await notifyOps({
        subject: 'New product: ' + parsed.name + ' (' + seller.businessName + ')',
        text: 'NEW PRODUCT LISTED\n' + parsed.name + ' - NGN ' + new Intl.NumberFormat('en-NG').format(parsed.price) + '\nSeller: ' + seller.businessName + '\n' + (process.env.NEXT_PUBLIC_SITE_URL || 'https://jemi.com.ng') + '/products/' + created[0].slug,
      });
    } catch (e) { console.error('[notify]', e); }

    return ok({ id: created[0].id, slug: created[0].slug });
  });
}