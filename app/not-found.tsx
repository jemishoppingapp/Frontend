import { BrandedFallback } from '@/components/BrandedFallback';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return <BrandedFallback variant="404" />;
}