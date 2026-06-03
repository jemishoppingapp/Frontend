import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { Package, LogOut } from 'lucide-react';
import { getCurrentUser } from '@/lib/session';
import { db, schema } from '@/db';
import { Container } from '@/components/Container';

export const metadata: Metadata = { title: 'Seller Dashboard', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function SellerHomePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'seller') {
    if (user.role === 'admin') redirect('/admin');
    else redirect('/');
  }

  const rows = await db()
    .select({ status: schema.sellers.status })
    .from(schema.sellers)
    .where(eq(schema.sellers.userId, user.id))
    .limit(1);
  const status = rows[0]?.status;

  if (status !== 'approved') {
    redirect('/sellers/pending');
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="border-b border-border-soft">
        <Container className="h-14 sm:h-16 flex items-center justify-between">
          <Link href="/seller" className="font-display text-xl font-bold tracking-tight text-primary">
            JEMI <span className="text-fg-3 font-normal text-sm">/ seller</span>
          </Link>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="inline-flex items-center gap-1 text-sm text-fg-2 hover:text-fg">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </Container>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary-soft mb-5">
            <Package className="h-7 w-7 text-primary" />
          </div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-3">Approved</p>
          <h1 className="font-display text-3xl font-semibold text-fg mb-3">Welcome to JEMI.</h1>
          <p className="text-sm text-fg-2 leading-relaxed">
            Your seller account is approved. The full seller dashboard (product management, orders, sales reports) is coming in the next release.
          </p>
          <p className="text-xs text-fg-3 mt-5">
            Hi {user.name} — signed in as <span className="font-mono text-fg-2">{user.email}</span>
          </p>
        </div>
      </main>
    </div>
  );
}