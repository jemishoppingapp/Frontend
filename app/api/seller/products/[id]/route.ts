import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@/db';
import { requireSeller } from '@/lib/seller-session';
import { ok, fail, failValidation, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const imageSchema = z.object({
  url: z.string().trim().url(),
  publicId: z.string().trim().max(200),
  alt: z.string().trim().max(200),
});

const patchSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  price: z.number().min(0).optional(),
  marginPercent: z.number().min(0).max(100).optional(),
  originalPrice: z.number().min(0).nullable().optional(),
  category: z.enum(['fashion', 'electronics', 'food', 'accessories']).optional(),
  stockQuantity: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  features: z.array(z.string().trim().max(200)).optional(),
  images: z.array(imageSchema).max(5).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { seller } = await requireSeller();
    const { id } = await params;

    let parsed: z.infer<typeof patchSchema>;
    try {
      const body = await req.json();
      parsed = patchSchema.parse(body);
    } catch (err) {
      if (err instanceof z.ZodError) return failValidation(err);
      return fail('VALIDATION_ERROR', 'Invalid input.');
    }

    // Ownership check
    const existing = await db().select({ id: schema.products.id })
      .from(schema.products)
      .where(and(eq(schema.products.id, id), eq(schema.products.sellerId, seller.id)))
      .limit(1);
    if (existing.length === 0) {
      return fail('NOT_FOUND', 'Product not found.');
    }

    // Category restriction
    if (
      parsed.category !== undefined &&
      seller.businessTypeCategory !== 'other' &&
      parsed.category !== seller.businessTypeCategory
    ) {
      return fail(
        'VALIDATION_ERROR',
        `You can only list in the "${seller.businessTypeCategory}" category.`,
        'category'
      );
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.name !== undefined) updates.name = parsed.name;
    if (parsed.description !== undefined) updates.description = parsed.description;
    if (parsed.price !== undefined) updates.price = String(parsed.price);
    if (parsed.originalPrice !== undefined) updates.originalPrice = parsed.originalPrice !== null ? String(parsed.originalPrice) : null;
    if (parsed.category !== undefined) updates.category = parsed.category;
    if (parsed.stockQuantity !== undefined) {
      updates.stockQuantity = parsed.stockQuantity;
      updates.inStock = parsed.stockQuantity > 0;
    }
    if (parsed.isActive !== undefined) updates.isActive = parsed.isActive;
    if (parsed.features !== undefined) updates.features = parsed.features;
    if (parsed.images !== undefined) updates.images = parsed.images;

    await db().update(schema.products)
      .set(updates)
      .where(and(eq(schema.products.id, id), eq(schema.products.sellerId, seller.id)));

    return ok({ saved: true });
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { seller } = await requireSeller();
    const { id } = await params;

    const existing = await db().select({ id: schema.products.id })
      .from(schema.products)
      .where(and(eq(schema.products.id, id), eq(schema.products.sellerId, seller.id)))
      .limit(1);
    if (existing.length === 0) {
      return fail('NOT_FOUND', 'Product not found.');
    }

    await db().update(schema.products)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(schema.products.id, id), eq(schema.products.sellerId, seller.id)));

    return ok({ deleted: true });
  });
}