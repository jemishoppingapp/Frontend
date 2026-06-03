import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Clock, Mail, LogOut } from 'lucide-react';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/session';
import { db, schema } from '@/db';
import { Container } from '@/components/Container';

export const metadata: Metadata = { title: 'Application pending', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function SellerPendingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sellers/apply');
  if (user.role !== 'seller') {
    if (user.role === 'admin') redirect('/admin');
    else redirect('/');
  }

  // Look up status
  const rows = await db()
    .select({
      status: schema.sellers.status,
      businessName: schema.sellers.businessName,
      appliedAt: schema.sellers.appliedAt,
      rejectionReason: schema.sellers.rejectionReason,
    })
    .from(schema.sellers)
    .where(eq(schema.sellers.userId, user.id))
    .limit(1);
  const sellerRow = rows[0];

  // If already approved, send them to /seller dashboard
  if (sellerRow?.status === 'approved') {
    redirect('/seller');
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="border-b border-border-soft">
        <Container className="h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold tracking-tight text-primary">
            JEMI <span className="text-fg-3 font-normal text-sm">/ sellers</span>
          </Link>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="inline-flex items-center gap-1 text-sm text-fg-2 hover:text-fg">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </Container>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          {sellerRow?.status === 'pending' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-warning/10 mb-5">
                <Clock className="h-7 w-7 text-warning" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-warning font-medium mb-3">Under review</p>
              <h1 className="font-display text-3xl font-semibold text-fg mb-2">Thanks for applying.</h1>
              <p className="text-sm text-fg-2 mb-7">
                Your application for <span className="font-medium text-fg">{sellerRow.businessName}</span> is being reviewed.
                We typically respond within 48 hours.
              </p>
              <div className="rounded-2xl border border-border-soft bg-surface-1 p-5 text-left">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-fg mb-1">We'll email you</p>
                    <p className="text-xs text-fg-2 leading-relaxed">
                      Check <span className="font-mono text-fg">{user.email}</span> for an update.
                      Once approved, sign in at <Link href="/login" className="text-primary hover:underline">/login</Link> to start listing products.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-fg-3 mt-6">
                Submitted {new Date(sellerRow.appliedAt).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
          )}

          {sellerRow?.status === 'rejected' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-danger/10 mb-5">
                <Clock className="h-7 w-7 text-danger" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-danger font-medium mb-3">Application not approved</p>
              <h1 className="font-display text-3xl font-semibold text-fg mb-2">Sorry, we can't approve this application.</h1>
              {sellerRow.rejectionReason && (
                <p className="text-sm text-fg-2 mb-4">
                  Reason: <span className="text-fg">{sellerRow.rejectionReason}</span>
                </p>
              )}
              <p className="text-sm text-fg-2 mb-7">
                If you think this is a mistake, please reach out to support.
              </p>
            </div>
          )}

          {sellerRow?.status === 'suspended' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-danger/10 mb-5">
                <Clock className="h-7 w-7 text-danger" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-danger font-medium mb-3">Account suspended</p>
              <h1 className="font-display text-3xl font-semibold text-fg mb-2">Your seller account is suspended.</h1>
              <p className="text-sm text-fg-2 mb-7">
                Please contact JEMI support to resolve this.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}