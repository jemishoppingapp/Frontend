import { BrandedFallback } from '@/components/BrandedFallback';

/**
 * Route-level loading boundary. Next.js wraps every route in this
 * automatically while server components are streaming. Replaces the
 * default white screen with a branded spinner.
 */
export default function Loading() {
  return <BrandedFallback variant="loading" />;
}