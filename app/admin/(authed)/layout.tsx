import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

/**
 * Layout for all auth-required admin pages: dashboard, orders,
 * products, users. NOT applied to /admin/login.
 */
export default async function AdminAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    redirect('/admin/login');
  }

  return (
    <div className="admin-shell min-h-screen flex flex-col lg:flex-row bg-surface-1">
      <AdminSidebar adminName={user.name} adminEmail={user.email} />
      <main className="flex-1 min-w-0 page-fade">{children}</main>
    </div>
  );
}