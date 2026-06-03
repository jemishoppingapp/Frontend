import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, eq, sql } from 'drizzle-orm';
import {
  ChevronLeft, ShieldCheck, Ban, Clock, XCircle,
  Building2, MapPin, Phone, CreditCard, User,
} from 'lucide-react';
import { db, schema } from '@/db';
import { cn } from '@/lib/utils';
import { AdminSellerActions } from './AdminSellerActions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Seller Detail', robots: { index: false } };

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending review',
  approved: 'Approved',
  suspended: 'Suspended',
  rejected: 'Rejected',
};
const STATUS_COLOR: Record<string, string> = {
  pending: 'text-warning bg-warning/10',
  approved: 'text-success bg-success/10',
  suspended: 'text-danger bg-danger/10',
  rejected: 'text-fg-2 bg-surface-2',
};
const STATUS_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  approved: ShieldCheck,
  suspended: Ban,
  rejected: XCircle,
};

export default async function AdminSellerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const rows = await db()
    .select({ seller: schema.sellers, user: schema.users })
    .from(schema.sellers)
    .leftJoin(schema.users, eq(schema.sellers.userId, schema.users.id))
    .where(eq(schema.sellers.id, id))
    .limit(1);

  const row = rows[0];
  if (!row || !row.user) notFound();

  const { seller, user } = row;
  const Icon = STATUS_ICON[seller.status] ?? Clock;

  // Active product count (only meaningful for approved sellers)
  const productCountRows = await db()
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.products)
    .where(and(
      eq(schema.products.sellerId, seller.id),
      eq(schema.products.isActive, true),
    ));
  const activeProductCount = productCountRows[0]?.count ?? 0;

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-4xl">
      <Link href="/admin/sellers" className="inline-flex items-center gap-1 text-sm text-fg-2 hover:text-fg mb-5">
        <ChevronLeft className="h-4 w-4" /> All sellers
      </Link>

      <div className="mb-7">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-fg">{seller.businessName}</h1>
          <span className={cn(
            'inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full',
            STATUS_COLOR[seller.status]
          )}>
            <Icon className="h-2.5 w-2.5" />
            {STATUS_LABEL[seller.status]}
          </span>
        </div>
        <p className="text-sm text-fg-2">
          Applied{' '}
          {new Date(seller.appliedAt).toLocaleString('en-NG', {
            day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
          })}
        </p>
        {seller.approvedAt && (
          <p className="text-xs text-fg-3 mt-1">
            Approved{' '}
            {new Date(seller.approvedAt).toLocaleString('en-NG', {
              day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
            })}
          </p>
        )}
      </div>

      {/* Actions */}
      <AdminSellerActions
        sellerId={seller.id}
        status={seller.status}
        businessName={seller.businessName}
        activeProductCount={activeProductCount}
      />

      {/* Rejection reason if rejected */}
      {seller.status === 'rejected' && seller.rejectionReason && (
        <div className="mt-6 rounded-2xl border border-danger/30 bg-danger/5 p-5">
          <p className="text-xs font-medium text-fg-2 mb-2">Rejection reason</p>
          <p className="text-sm text-fg-1">{seller.rejectionReason}</p>
        </div>
      )}

      {/* Personal */}
      <section className="mt-6 bg-surface border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-4 inline-flex items-center gap-2">
          <User className="h-4 w-4 text-fg-2" /> Person
        </h2>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><dt className="text-fg-2 text-xs mb-0.5">Name</dt><dd className="text-fg">{user.name}</dd></div>
          <div><dt className="text-fg-2 text-xs mb-0.5">Email</dt><dd className="text-fg">{user.email}</dd></div>
          <div><dt className="text-fg-2 text-xs mb-0.5">Personal phone</dt><dd className="text-fg">{user.phone || '—'}</dd></div>
          <div>
            <dt className="text-fg-2 text-xs mb-0.5">Manage user</dt>
            <dd>
              <Link href={`/admin/users/${user.id}/edit`} className="text-primary text-sm hover:underline">
                Open user record →
              </Link>
            </dd>
          </div>
        </dl>
      </section>

      {/* Business */}
      <section className="mt-5 bg-surface border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-4 inline-flex items-center gap-2">
          <Building2 className="h-4 w-4 text-fg-2" /> Business
        </h2>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-fg-2 text-xs mb-0.5">Category</dt>
            <dd className="text-fg capitalize">{seller.businessTypeCategory}</dd>
          </div>
          <div>
            <dt className="text-fg-2 text-xs mb-0.5">Business phone</dt>
            <dd className="text-fg inline-flex items-center gap-1">
              <Phone className="h-3 w-3 text-fg-3" /> {seller.businessPhone}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-fg-2 text-xs mb-0.5">Address</dt>
            <dd className="text-fg inline-flex items-start gap-1">
              <MapPin className="h-3 w-3 text-fg-3 mt-1 shrink-0" /> {seller.businessAddress}
            </dd>
          </div>
          {seller.businessTypeNotes && (
            <div className="sm:col-span-2">
              <dt className="text-fg-2 text-xs mb-0.5">Description</dt>
              <dd className="text-fg leading-relaxed">{seller.businessTypeNotes}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* Bank */}
      <section className="mt-5 bg-surface border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-4 inline-flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-fg-2" /> Payout bank
        </h2>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-fg-2 text-xs mb-0.5">Bank</dt>
            <dd className="text-fg">{seller.bankName}</dd>
          </div>
          <div>
            <dt className="text-fg-2 text-xs mb-0.5">Account number</dt>
            <dd className="text-fg font-mono">{seller.bankAccountNumber}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-fg-2 text-xs mb-0.5">Account name</dt>
            <dd className="text-fg">{seller.bankAccountName}</dd>
          </div>
          <div>
            <dt className="text-fg-2 text-xs mb-0.5">Platform fee</dt>
            <dd className="text-fg">{seller.platformFeePercent}%</dd>
          </div>
        </dl>
        <p className="text-[11px] text-fg-3 mt-4">
          You'll transfer manually to this bank on settlement. Verify name + number with the seller before first payout.
        </p>
      </section>

      {/* Products summary (for approved/suspended) */}
      {(seller.status === 'approved' || seller.status === 'suspended') && (
        <section className="mt-5 bg-surface border border-border-soft rounded-2xl p-6">
          <h2 className="font-display text-base font-semibold text-fg mb-2">Activity</h2>
          <p className="text-sm text-fg-2">
            <span className="font-medium text-fg">{activeProductCount}</span> active product{activeProductCount === 1 ? '' : 's'}.
            {seller.status === 'suspended' && (
              <span className="text-warning"> All products auto-hidden while suspended.</span>
            )}
          </p>
        </section>
      )}
    </div>
  );
}