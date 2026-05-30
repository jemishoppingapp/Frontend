import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@/db';
import { requireAdmin } from '@/lib/session';
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
  originalPrice: z.number().min(0).nullable().optional(),
  category: z.enum(['fashion', 'electronics', 'food', 'accessories']).optional(),
  seller: z.string().trim().min(1).max(200).optional(),
  stockQuantity: z.number().int().min(0).optional(),
  inStock: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  features: z.array(z.string().trim().max(200)).optional(),
  images: z.array(imageSchema).max(5).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    try {
      await requireAdmin();
    } catch {
      return fail('FORBIDDEN', 'Admin access required.');
    }

    const { id } = await params;

    let parsed: z.infer<typeof patchSchema>;
    try {
      const body = await req.json();
      parsed = patchSchema.parse(body);
    } catch (err) {
      if (err instanceof z.ZodError) return failValidation(err);
      return fail('VALIDATION_ERROR', 'Invalid input.');
    }

    const existing = await db().select({ id: schema.products.id })
      .from(schema.products).where(eq(schema.products.id, id)).limit(1);
    if (existing.length === 0) {
      return fail('NOT_FOUND', 'Product does not exist.');
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.name !== undefined) updates.name = parsed.name;
    if (parsed.description !== undefined) updates.description = parsed.description;
    if (parsed.price !== undefined) updates.price = String(parsed.price);
    if (parsed.originalPrice !== undefined) updates.originalPrice = parsed.originalPrice !== null ? String(parsed.originalPrice) : null;
    if (parsed.category !== undefined) updates.category = parsed.category;
    if (parsed.seller !== undefined) updates.seller = parsed.seller;
    if (parsed.stockQuantity !== undefined) updates.stockQuantity = parsed.stockQuantity;
    if (parsed.inStock !== undefined) updates.inStock = parsed.inStock;
    if (parsed.isActive !== undefined) updates.isActive = parsed.isActive;
    if (parsed.isFeatured !== undefined) updates.isFeatured = parsed.isFeatured;
    if (parsed.features !== undefined) updates.features = parsed.features;
    if (parsed.images !== undefined) updates.images = parsed.images;

    await db().update(schema.products).set(updates).where(eq(schema.products.id, id));
    return ok({ saved: true });
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    try {
      await requireAdmin();
    } catch {
      return fail('FORBIDDEN', 'Admin access required.');
    }

    const { id } = await params;

    const existing = await db().select({ id: schema.products.id })
      .from(schema.products).where(eq(schema.products.id, id)).limit(1);
    if (existing.length === 0) {
      return fail('NOT_FOUND', 'Product does not exist.');
    }

    await db().update(schema.products)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(schema.products.id, id));

    return ok({ deleted: true });
  });
}