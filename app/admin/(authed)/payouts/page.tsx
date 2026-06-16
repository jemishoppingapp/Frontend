import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/session';
import { getPayoutQueue } from '@/lib/payouts-server';
import { formatCurrency } from '@/lib/utils';
import { PayoutQueueSection } from './PayoutQueueSection';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Payouts', robots: { index: false } };

export default async function AdminPayoutsPage() {
  await requireAdmin();
  const { weekly, monthly } = await getPayoutQueue();

  const transfersEnabled = process.env.PAYSTACK_TRANSFERS_ENABLED === 'true';
  const weeklyTotal = weekly.reduce((s, e) => s + e.availableBalance, 0);
  const monthlyTotal = monthly.reduce((s, e) => s + e.availableBalance, 0);

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-5xl">
      <div className="mb-7">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-fg mb-1">Payouts</h1>
        <p className="text-sm text-fg-2">
          Sellers with a balance ready to be paid out. Total due:{' '}
          <span className="font-medium text-fg">{formatCurrency(weeklyTotal + monthlyTotal)}</span>
        </p>
      </div>

      {!transfersEnabled && (
        <div className="mb-6 rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-fg-1">
          <span className="font-semibold">Manual mode.</span> Paystack transfers
          aren&apos;t enabled yet, so payouts are recorded manually: send the money
          via your bank or the Paystack dashboard, then record the reference here.
          Enable <code className="text-xs">PAYSTACK_TRANSFERS_ENABLED</code> once your
          account supports transfers.
        </div>
      )}

      <PayoutQueueSection
        title="Weekly — due now"
        cadenceLabel="weekly"
        entries={weekly}
        transfersEnabled={transfersEnabled}
      />

      <div className="h-8" />

      <PayoutQueueSection
        title="Monthly — due now"
        cadenceLabel="monthly"
        entries={monthly}
        transfersEnabled={transfersEnabled}
      />
    </div>
  );
}