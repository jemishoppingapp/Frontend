import bcrypt from 'bcryptjs';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { dbPool } from '@/db/pool';
import { db, schema } from '@/db';
import { signToken } from '@/lib/auth';
import { setAuthCookie } from '@/lib/cookies';
import { ok, fail, failValidation, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BUSINESS_TYPES = ['fashion', 'electronics', 'food', 'accessories', 'other'] as const;

const applySchema = z.object({
  // Personal
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters.').max(100),
  email: z.string().trim().toLowerCase().email('Please enter a valid email.'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[A-Za-z]/, 'Password must contain a letter.')
    .regex(/\d/, 'Password must contain a number.'),
  phone: z.string().trim().min(7, 'Phone is too short.').max(20),

  // Business
  businessName: z.string().trim().min(2, 'Business name is required.').max(200),
  businessTypeCategory: z.enum(BUSINESS_TYPES, {
    errorMap: () => ({ message: 'Please select a business category.' }),
  }),
  businessTypeNotes: z.string().trim().max(500).default(''),
  businessAddress: z.string().trim().min(5, 'Please enter a business address.').max(500),
  businessPhone: z.string().trim().min(7).max(20),

  // Bank
  bankAccountName: z.string().trim().min(2, 'Account name is required.').max(200),
  bankAccountNumber: z.string().trim().regex(/^\d{10}$/, 'Account number must be exactly 10 digits.'),
  bankCode: z.string().trim().min(1, 'Please select a bank.').max(10),
  bankName: z.string().trim().min(1).max(200),
});

export async function POST(req: Request) {
  return withErrorHandling(async () => {
    let parsed: z.infer<typeof applySchema>;
    try {
      const body = await req.json();
      parsed = applySchema.parse(body);
    } catch (err) {
      if (err instanceof z.ZodError) return failValidation(err);
      return fail('VALIDATION_ERROR', 'Please check your inputs.');
    }

    // Email uniqueness check
    const existingUser = await db()
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, parsed.email))
      .limit(1);
    if (existingUser.length > 0) {
      return fail(
        'EMAIL_TAKEN',
        'An account with this email already exists. Sellers must use a fresh email — separate from buyer accounts.',
        'email'
      );
    }

    const passwordHash = await bcrypt.hash(parsed.password, 12);

    // Insert user + seller atomically
    return await dbPool().transaction(async (tx) => {
      // Create user with role=seller, profileCompleted=true (they gave us
      // a lot of info; we don't want to send them to /profile/complete)
      await tx.execute(sql`
        INSERT INTO users (email, password, name, phone, role, profile_completed)
        VALUES (${parsed.email}, ${passwordHash}, ${parsed.fullName}, ${parsed.phone}, 'seller', true)
      `);

      const userRows = await tx
        .select({ id: schema.users.id, email: schema.users.email, role: schema.users.role })
        .from(schema.users)
        .where(eq(schema.users.email, parsed.email))
        .limit(1);
      const user = userRows[0];
      if (!user) {
        throw new Error('User insert succeeded but lookup failed');
      }

      // Create sellers row
      await tx.execute(sql`
        INSERT INTO sellers (
          user_id, business_name, business_type_category, business_type_notes,
          business_address, business_phone,
          bank_account_name, bank_account_number, bank_code, bank_name,
          status, platform_fee_percent
        ) VALUES (
          ${user.id}, ${parsed.businessName}, ${parsed.businessTypeCategory}, ${parsed.businessTypeNotes},
          ${parsed.businessAddress}, ${parsed.businessPhone},
          ${parsed.bankAccountName}, ${parsed.bankAccountNumber}, ${parsed.bankCode}, ${parsed.bankName},
          'pending', '5.00'
        )
      `);

      // Sign them in immediately so they land on /sellers/pending logged-in
      const token = await signToken({ sub: user.id, email: user.email, role: user.role });
      await setAuthCookie(token);

      return ok({ applied: true });
    });
  });
}