import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@/db';
import { requireSeller } from '@/lib/seller-session';
import { ok, fail, failValidation, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const businessSchema = z.object({
  kind: z.literal('business'),
  businessName: z.string().trim().min(2, 'Business name is required.').max(200),
  businessTypeNotes: z.string().trim().max(500).default(''),
  businessAddress: z.string().trim().min(5, 'Please enter a business address.').max(500),
  businessPhone: z.string().trim().min(7).max(20),
});

const cadenceSchema = z.object({
  kind: z.literal('cadence'),
  payoutCadence: z.enum(['weekly', 'monthly']),
});

const patchSchema = z.discriminatedUnion('kind', [businessSchema, cadenceSchema]);

export async function PATCH(req: Request) {
  return withErrorHandling(async () => {
    const { seller } = await requireSeller();

    let parsed: z.infer<typeof patchSchema>;
    try {
      const body = await req.json();
      parsed = patchSchema.parse(body);
    } catch (err) {
      if (err instanceof z.ZodError) return failValidation(err);
      return fail('VALIDATION_ERROR', 'Invalid input.');
    }

    if (parsed.kind === 'business') {
      await db().update(schema.sellers).set({
        businessName: parsed.businessName,
        businessTypeNotes: parsed.businessTypeNotes,
        businessAddress: parsed.businessAddress,
        businessPhone: parsed.businessPhone,
        updatedAt: new Date(),
      }).where(eq(schema.sellers.id, seller.id));
      return ok({ saved: true });
    }

    if (parsed.kind === 'cadence') {


      await db().update(schema.sellers).set({


        payoutCadence: parsed.payoutCadence,


        updatedAt: new Date(),


      }).where(eq(schema.sellers.id, seller.id));


      return ok({ saved: true });


    }



    return fail('VALIDATION_ERROR', 'Unknown patch kind.');
  });
}