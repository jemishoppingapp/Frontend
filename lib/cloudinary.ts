/**
 * Cloudinary helpers.
 *
 * Two modes:
 *   1. Server-side: full SDK for signed uploads / deletes (used in admin
 *      seed scripts and any future admin upload endpoint).
 *   2. URL transforms: pure-string helpers for the client to build
 *      sized image URLs. No SDK needed in the browser.
 */
import { v2 as cloudinary } from 'cloudinary';

const CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME ||
  '';

// Configure the SDK if all server creds are present. We do this lazily
// at module load — safe because the SDK doesn't connect until called.
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export { cloudinary };

/**
 * Build a transformed Cloudinary URL from a public_id.
 * Returns null if we don't have a cloud name configured (dev safety —
 * the caller can fall back to a placeholder).
 *
 * Example:
 *   cloudinaryUrl('jemi/products/tshirt-black', { w: 400, h: 400, c: 'fit' })
 *   -> https://res.cloudinary.com/<cloud>/image/upload/w_400,h_400,c_fit,f_auto,q_auto/jemi/products/tshirt-black
 */
export interface CloudinaryTransform {
  w?: number;
  h?: number;
  c?: 'fit' | 'fill' | 'pad' | 'crop' | 'scale';
  q?: number | 'auto';
  f?: 'auto' | 'webp' | 'jpg' | 'png';
  b?: string;            // background (e.g. 'white')
  g?: 'auto' | 'center'; // gravity
}

export function cloudinaryUrl(publicId: string, t: CloudinaryTransform = {}): string | null {
  if (!CLOUD_NAME) return null;
  if (!publicId) return null;

  const defaults: CloudinaryTransform = { f: 'auto', q: 'auto', ...t };
  const parts: string[] = [];
  if (defaults.w) parts.push(`w_${defaults.w}`);
  if (defaults.h) parts.push(`h_${defaults.h}`);
  if (defaults.c) parts.push(`c_${defaults.c}`);
  if (defaults.q !== undefined) parts.push(`q_${defaults.q}`);
  if (defaults.f) parts.push(`f_${defaults.f}`);
  if (defaults.b) parts.push(`b_${defaults.b}`);
  if (defaults.g) parts.push(`g_${defaults.g}`);

  const transform = parts.join(',');
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transform}/${publicId}`;
}

/**
 * OG image URL — square logo, padded to 1200x630 with white background.
 * Used in the root layout's metadata.openGraph.images and per-page overrides.
 *
 * Pass the public_id of your logo asset (e.g. 'jemi/brand/logo-square').
 */
export function ogImageUrl(logoPublicId: string): string | null {
  if (!CLOUD_NAME || !logoPublicId) return null;
  // Two-step transform: fit inside 400x400, then pad to 1200x630 white.
  return (
    `https://res.cloudinary.com/${CLOUD_NAME}/image/upload` +
    `/w_400,h_400,c_fit/w_1200,h_630,c_pad,b_white,f_auto,q_auto/` +
    logoPublicId
  );
}