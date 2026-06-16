import type { Metadata } from 'next';
import { desc, eq } from 'drizzle-orm';
import { Banknote } from 'lucide-react';
import { db, schema } from '@/db';
import { requireSeller } from '@/lib/seller-session';
import { getSellerEscrowSummary } from '@/lib/escrow-server';
import { formatCurrency, cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Payouts', robots: { index: false } };

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};
const STATUS_COLOR: Record<string, string> = {
  pending: 'text-warning bg-warning/10',
  processing: 'text-primary bg-primary/10',
  completed: 'text-success bg-success/10',
  failed: 'text-danger bg-danger/10',
};

export default async function SellerPayoutsPage() {
  const { seller } = await requireSeller();
  const summary = await getSellerEscrowSummary(seller.id);

  const rows = await db()
    .select()
    .from(schema.payouts)
    .where(eq(schema.payouts.sellerId, seller.id))
    .orderBy(desc(schema.payouts.createdAt))
    .limit(50);

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-3xl">
      <div className="mb-7">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-fg mb-1">Payouts</h1>
        <p className="text-sm text-fg-2">Money paid out to your bank.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-surface border border-border-soft rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-[0.15em] text-fg-2 font-medium mb-1">Pending</p>
          <p className="font-display text-lg font-semibold text-warning leading-none">{formatCurrency(summary.pendingBalance)}</p>
        </div>
        <div className="bg-surface border border-border-soft rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-[0.15em] text-fg-2 font-medium mb-1">Available</p>
          <p className="font-display text-lg font-semibold text-success leading-none">{formatCurrency(summary.availableBalance)}</p>
        </div>
        <div className="bg-surface border border-border-soft rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-[0.15em] text-fg-2 font-medium mb-1">Paid out</p>
          <p className="font-display text-lg font-semibold text-fg leading-none">{formatCurrency(summary.paidOut)}</p>
        </div>
      </div>

      <div className="bg-surface border border-border-soft rounded-2xl overflow-hidden">
        <header className="px-5 py-4 border-b border-border-soft">
          <h2 className="font-display text-base font-semibold text-fg">History</h2>
        </header>
        {rows.length === 0 ? (
          <div className="p-10 text-center">
            <Banknote className="h-8 w-8 text-fg-3 mx-auto mb-3" />
            <p className="text-sm text-fg-2">
              No payouts yet. Your available balance is paid out{' '}
              {seller.businessName ? '' : ''}per your chosen cadence.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border-soft">
            {rows.map((p) => (
              <li key={p.id} className="px-5 py-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn(
                      'inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full',
                      STATUS_COLOR[p.status] || 'text-fg-2 bg-surface-2'
                    )}>
                      {STATUS_LABEL[p.status] || p.status}
                    </span>
                    <span className="text-[11px] text-fg-3">
                      {p.method === 'paystack' ? 'Paystack transfer' : 'Bank transfer'}
                    </span>
                  </div>
                  <p className="text-xs text-fg-2">
                    {new Date(p.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {p.transferRef && <span className="font-mono text-fg-3"> · {p.transferRef}</span>}
                  </p>
                </div>
                <p className="font-display text-base font-semibold text-fg whitespace-nowrap">
                  {formatCurrency(Number(p.amount))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}