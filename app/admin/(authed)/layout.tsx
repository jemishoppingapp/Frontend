import { redirect } from 'next/navigation';
import { eq, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/session';
import { db, schema } from '@/db';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export const dynamic = 'force-dynamic';

export default async function AdminAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    redirect('/admin/login');
  }

  // Fetch pending counts for sidebar badges (single small query per page)
  let pendingSellersCount = 0;
  let pendingOrdersCount = 0;
  try {
    const [sellersCount, ordersCount] = await Promise.all([
      db().select({ count: sql<number>`count(*)::int` })
        .from(schema.sellers).where(eq(schema.sellers.status, 'pending')),
      db().select({ count: sql<number>`count(*)::int` })
        .from(schema.orders).where(eq(schema.orders.status, 'pending')),
    ]);
    pendingSellersCount = sellersCount[0]?.count ?? 0;
    pendingOrdersCount = ordersCount[0]?.count ?? 0;
  } catch {
    // If DB hiccups, just don't show badges. Layout still renders.
  }

  return (
    <div className="admin-shell min-h-screen flex flex-col lg:flex-row bg-surface-1">
      <AdminSidebar
        adminName={user.name}
        adminEmail={user.email}
        pendingSellersCount={pendingSellersCount}
        pendingOrdersCount={pendingOrdersCount}
      />
      <main className="flex-1 min-w-0 page-fade">{children}</main>
    </div>
  );
}