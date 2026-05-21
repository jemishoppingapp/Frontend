import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Class name merger. Use everywhere we conditionally compose Tailwind
 * classes — twMerge resolves conflicts like "p-2 p-4" → "p-4".
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a numeric value as Nigerian Naira.
 * Internal storage is always a Number (kobo NOT used — we store whole
 * naira; Paystack wants kobo at the API boundary, we convert there).
 *
 *   formatCurrency(12500)  -> "₦12,500"
 *   formatCurrency(0)      -> "₦0"
 */
export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return '₦0';
  return '₦' + Math.round(amount).toLocaleString('en-NG');
}

/**
 * URL-safe slug from a string. Used for product slugs.
 *   slugify("Basic Tee Premium Cotton") -> "basic-tee-premium-cotton"
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Pickup code: 6 uppercase alphanumeric characters, ambiguity-free
 * (no 0/O, no 1/I/L). Shown to the customer on the verify page and
 * required for collection at the pickup point.
 *
 * 28-char alphabet, 6 chars → ~481M possibilities. Collision risk
 * is negligible for this scale.
 */
const PICKUP_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function generatePickupCode(): string {
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += PICKUP_ALPHABET[Math.floor(Math.random() * PICKUP_ALPHABET.length)];
  }
  return out;
}

/**
 * Order number: human-readable, prefixed.
 *   JM-YYMMDD-XXXXX
 *
 * Stable enough for support tickets and not embarrassingly long.
 */
export function generateOrderNumber(): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
  return `JM-${yy}${mm}${dd}-${rand}`;
}

/**
 * Convert Naira (our storage) to kobo (Paystack API).
 *   100 -> 10000
 */
export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

/**
 * Validate a Nigerian phone number. Accepts:
 *   08012345678, 07012345678, 09012345678
 *   +2348012345678, 2348012345678
 *
 * Returns the normalized form (+234 prefix, 13 chars) or null.
 */
export function normalizeNigerianPhone(input: string): string | null {
  const cleaned = input.replace(/[\s-]/g, '');
  // 0[789]XXXXXXXXX  (11 digits)
  let match = /^0([789]\d{9})$/.exec(cleaned);
  if (match) return '+234' + match[1];
  // \+?234[789]XXXXXXXXX  (13 digits)
  match = /^\+?234([789]\d{9})$/.exec(cleaned);
  if (match) return '+234' + match[1];
  return null;
}