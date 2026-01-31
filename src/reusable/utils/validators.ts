import { z } from 'zod';

// Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register Schema
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    phone: z
      .string()
      .min(1, 'Phone number is required')
      .regex(
        /^(\+234|0)[789][01]\d{8}$/,
        'Please enter a valid Nigerian phone number'
      ),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Shipping Address Schema
export const shippingSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      /^(\+234|0)[789][01]\d{8}$/,
      'Please enter a valid Nigerian phone number'
    ),
  address: z
    .string()
    .min(1, 'Address is required')
    .min(10, 'Please enter a complete address'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  notes: z.string().optional(),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;

// Profile Update Schema
export const profileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(\+234|0)[789][01]\d{8}$/.test(val),
      'Please enter a valid Nigerian phone number'
    ),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Review Schema
export const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, 'Please select a rating')
    .max(5, 'Rating must be between 1 and 5'),
  comment: z
    .string()
    .min(1, 'Review comment is required')
    .min(10, 'Review must be at least 10 characters'),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

// Contact Form Schema
export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required').min(20, 'Message too short'),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// Utility validation functions
export const isValidEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success;
};

export const isValidPhone = (phone: string): boolean => {
  return /^(\+234|0)[789][01]\d{8}$/.test(phone);
};

export const isValidPassword = (password: string): boolean => {
  return (
    password.length >= 6 &&
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
  );
};
