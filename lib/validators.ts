/**
 * Shared zod schemas used across auth + profile API routes and forms.
 * One source of truth so client validation matches server validation.
 */
import { z } from 'zod';
import { normalizeNigerianPhone } from '@/lib/utils';

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Please enter a valid email');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password is too long')  // bcrypt's max input
  .refine(
    (p) => /[a-z]/i.test(p) && /\d/.test(p),
    'Password must contain a letter and a number'
  );

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Please enter your name')
  .max(100, 'Name is too long');

/**
 * Nigerian phone schema. Accepts the four common input formats and
 * normalizes to +234... at parse time. Rejects anything else.
 */
export const nigerianPhoneSchema = z
  .string()
  .trim()
  .transform((val, ctx) => {
    const normalized = normalizeNigerianPhone(val);
    if (!normalized) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a valid Nigerian phone number',
      });
      return z.NEVER;
    }
    return normalized;
  });

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Please enter your password'),
});

export const profileCompleteSchema = z.object({
  phone: nigerianPhoneSchema,
  alt_phone: z
    .string()
    .trim()
    .optional()
    .transform((val) => {
      if (!val) return '';
      const normalized = normalizeNigerianPhone(val);
      return normalized ?? '';
    }),
  address: z.string().trim().min(5, 'Please enter your address').max(500),
  department: z.string().trim().min(2, 'Please enter your department').max(100),
  level: z.enum([
    '100 Level',
    '200 Level',
    '300 Level',
    '400 Level',
    '500 Level',
    'Postgraduate',
    'Staff',
    'Non-student',
  ]),
});

export const profileUpdateSchema = z.object({
  name: nameSchema.optional(),
  nickname: z.string().trim().max(100).optional(),
  alt_phone: z
    .string()
    .trim()
    .optional()
    .transform((val) => {
      if (!val) return '';
      const normalized = normalizeNigerianPhone(val);
      return normalized ?? '';
    }),
  address: z.string().trim().max(500).optional(),
  department: z.string().trim().max(100).optional(),
});

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Please enter your current password'),
    new_password: passwordSchema,
    confirm_password: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "New passwords don't match",
    path: ['confirm_password'],
  });