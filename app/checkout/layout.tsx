import { MainLayout } from '@/components/layout/MainLayout';
import { requireAuth } from '@/lib/session';

// Auth-required. Middleware also gates /checkout/*, but defense-in-depth.
export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth('/checkout');
  return <MainLayout>{children}</MainLayout>;
}