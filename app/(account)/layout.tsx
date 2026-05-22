import { MainLayout } from '@/components/layout/MainLayout';
import { requireAuth } from '@/lib/session';

/**
 * (account) route group: requires auth, shows MainLayout (header + footer).
 * Covers /profile, /profile/complete, /orders, /orders/[orderNumber].
 *
 * Note: middleware also gates these paths, so this is defense-in-depth.
 */
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return <MainLayout>{children}</MainLayout>;
}