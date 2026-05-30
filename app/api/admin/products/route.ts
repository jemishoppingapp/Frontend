import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@/db';
import { requireAdmin } from '@/lib/session';
import { ok, fail, failValidation, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const imageSchema = z.object({
  url: z.string().trim().url('Image URL must be a valid URL.'),
  publicId: z.string().trim().max(200),
  alt: z.string().trim().max(200),
});

const createSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(200),
  slug: z.string().trim().min(1, 'Slug is required.').max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and dashes.'),
  description: z.string().trim().max(5000).default(''),
  price: z.number().min(0, 'Price must be a positive number.'),
  originalPrice: z.number().min(0).nullable().optional(),
  category: z.enum(['fashion', 'electronics', 'food', 'accessories']),
  seller: z.string().trim().min(1).max(200),
  stockQuantity: z.number().int().min(0),
  inStock: z.boolean().default(true),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  features: z.array(z.string().trim().max(200)).default([]),
  images: z.array(imageSchema).min(1, 'At least one image is required.').max(5, 'Maximum 5 images.'),
});

export async function POST(req: Request) {
  return withErrorHandling(async () => {
    try {
      await requireAdmin();
    } catch {
      return fail('FORBIDDEN', 'Admin access required.');
    }

    let parsed: z.infer<typeof createSchema>;
    try {
      const body = await req.json();
      parsed = createSchema.parse(body);
    } catch (err) {
      if (err instanceof z.ZodError) return failValidation(err);
      return fail('VALIDATION_ERROR', 'Invalid input.');
    }

    // Check slug uniqueness
    const existing = await db().select({ id: schema.products.id })
      .from(schema.products).where(eq(schema.products.slug, parsed.slug)).limit(1);
    if (existing.length > 0) {
      return fail('VALIDATION_ERROR', `A product with slug "${parsed.slug}" already exists. Choose a different slug.`, 'slug');
    }

    await db().insert(schema.products).values({
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
      price: String(parsed.price),
      originalPrice: parsed.originalPrice ? String(parsed.originalPrice) : null,
      category: parsed.category,
      seller: parsed.seller,
      stockQuantity: parsed.stockQuantity,
      inStock: parsed.inStock,
      isActive: parsed.isActive,
      isFeatured: parsed.isFeatured,
      features: parsed.features.filter((f) => f.trim().length > 0),
      images: parsed.images,
      rating: '0',
      reviewCount: 0,
    });

    // Fetch back to return the id
    const created = await db().select({ id: schema.products.id, slug: schema.products.slug })
      .from(schema.products).where(eq(schema.products.slug, parsed.slug)).limit(1);

    return ok({ id: created[0].id, slug: created[0].slug });
  });
}