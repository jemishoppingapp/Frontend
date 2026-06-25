import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@/db';
import { requireAdmin } from '@/lib/session';
import { ok, fail, failValidation, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BCRYPT_ROUNDS = 12;

// The edit form sends one of four shapes, discriminated by `kind`.
const profileSchema = z.object({
  kind: z.literal('profile'),
  name: z.string().trim().min(1, 'Name is required.').max(100),
  phone: z.string().trim().max(20).default(''),
  alt_phone: z.string().trim().max(20).default(''),
  address: z.string().trim().max(500).default(''),
  department: z.string().trim().max(100).default(''),
  level: z.string().trim().max(50).default(''),
});

const passwordSchema = z.object({
  kind: z.literal('password_reset'),
  new_password: z.string().min(8, 'Password must be at least 8 characters.').max(72),
});

const roleSchema = z.object({
  kind: z.literal('role'),
  role: z.enum(['buyer', 'admin', 'seller']),
});

const disabledSchema = z.object({
  kind: z.literal('disabled'),
  is_disabled: z.boolean(),
});

const patchSchema = z.discriminatedUnion('kind', [
  profileSchema, passwordSchema, roleSchema, disabledSchema,
]);

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    let admin;
    try {
      admin = await requireAdmin();
    } catch {
      return fail('FORBIDDEN', 'Admin access required.');
    }

    const { id } = await params;

    // Confirm the target user exists.
    const rows = await db().select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    const target = rows[0];
    if (!target) return fail('NOT_FOUND', 'User not found.');

    let parsed: z.infer<typeof patchSchema>;
    try {
      const body = await req.json();
      parsed = patchSchema.parse(body);
    } catch (err) {
      if (err instanceof z.ZodError) return failValidation(err);
      return fail('VALIDATION_ERROR', 'Invalid request body.');
    }

    if (parsed.kind === 'profile') {
      await db().update(schema.users).set({
        name: parsed.name,
        phone: parsed.phone,
        altPhone: parsed.alt_phone,
        address: parsed.address,
        department: parsed.department,
        level: parsed.level,
        updatedAt: new Date(),
      }).where(eq(schema.users.id, id));
      return ok({ success: true });
    }

    if (parsed.kind === 'password_reset') {
      // Match the register route: bcryptjs, 12 rounds.
      if (!/[A-Za-z]/.test(parsed.new_password) || !/\d/.test(parsed.new_password)) {
        return fail('VALIDATION_ERROR', 'Password must contain a letter and a number.', 'new_password');
      }
      const hash = await bcrypt.hash(parsed.new_password, BCRYPT_ROUNDS);
      await db().update(schema.users).set({
        password: hash,
        updatedAt: new Date(),
      }).where(eq(schema.users.id, id));
      return ok({ success: true });
    }

    if (parsed.kind === 'role') {
      // Guardrail: don't let an admin strip their OWN admin role here.
      if (target.id === admin.id && parsed.role !== 'admin') {
        return fail('VALIDATION_ERROR', "You can't remove your own admin role.");
      }
      // Sellers can never be promoted to admin (business rule).
      if (target.role === 'seller' && parsed.role === 'admin') {
        return fail('VALIDATION_ERROR', 'Seller accounts cannot be promoted to admin.');
      }
      await db().update(schema.users).set({
        role: parsed.role,
        updatedAt: new Date(),
      }).where(eq(schema.users.id, id));
      return ok({ success: true });
    }

    if (parsed.kind === 'disabled') {
      // Guardrail: don't let an admin disable themselves.
      if (target.id === admin.id && parsed.is_disabled) {
        return fail('VALIDATION_ERROR', "You can't disable your own account.");
      }
      await db().update(schema.users).set({
        isDisabled: parsed.is_disabled,
        updatedAt: new Date(),
      }).where(eq(schema.users.id, id));
      return ok({ success: true });
    }

    return fail('VALIDATION_ERROR', 'Unknown action.');
  });
}