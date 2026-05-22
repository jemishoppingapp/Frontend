import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { requireAuth } from '@/lib/session';

// Auth-required, and also requires profile_completed (we need phone +
// pickup address to fulfill the order). Middleware also gates /checkout/*.
export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth('/checkout');
  if (!user.profile_completed) {
    redirect('/profile/complete?from=/checkout');
  }
  return <MainLayout>{children}</MainLayout>;
}