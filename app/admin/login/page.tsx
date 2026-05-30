import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';
import { AdminLoginForm } from './AdminLoginForm';

export const metadata: Metadata = {
  title: 'Admin Sign in',
  robots: { index: false },
};

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user?.role === 'admin') {
    redirect('/admin');
  }

  return (
    <div className="admin-shell min-h-screen flex flex-col">
      <header className="border-b border-border-soft bg-surface">
        <div className="max-w-7xl mx-auto px-4 h-14 sm:h-16 flex items-center">
          <Link href="/" className="font-display text-xl font-bold tracking-tight text-primary">
            JEMI <span className="text-fg-3 font-normal text-sm">/ admin</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <AdminLoginForm />
        </div>
      </main>
    </div>
  );
}