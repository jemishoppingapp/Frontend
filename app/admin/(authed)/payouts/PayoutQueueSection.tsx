'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Send, Banknote, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch, ApiError } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

interface Entry {
  sellerId: string;
  businessName: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  availableBalance: number;
  pendingBalance: number;
}

export function PayoutQueueSection({
  title, cadenceLabel, entries, transfersEnabled,
}: {
  title: string;
  cadenceLabel: string;
  entries: Entry[];
  transfersEnabled: boolean;
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-display text-base font-semibold text-fg">{title}</h2>
        <span className="text-xs text-fg-2">{entries.length} seller{entries.length === 1 ? '' : 's'}</span>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-border-soft bg-surface-1 py-10 text-center text-sm text-fg-2">
          No {cadenceLabel} payouts due. Balances appear here as orders complete.
        </div>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <PayoutRow key={entry.sellerId} entry={entry} transfersEnabled={transfersEnabled} />
          ))}
        </ul>
      )}
    </section>
  );
}

function PayoutRow({ entry, transfersEnabled }: { entry: Entry; transfersEnabled: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [transferRef, setTransferRef] = useState('');
  const [note, setNote] = useState('');
  const [paying, setPaying] = useState(false);

  async function pay(method: 'manual' | 'paystack') {
    if (method === 'manual' && transferRef.trim().length === 0) {
      if (!confirm('Record this payout without a transfer reference? You can add one later by paying through Paystack instead.')) {
        return;
      }
    }
    if (!confirm(
      `${method === 'paystack' ? 'Send' : 'Record'} payout of ${formatCurrency(entry.availableBalance)} to ${entry.businessName}?\n\n` +
      `${entry.accountName} — ${entry.bankName} ${entry.accountNumber}`
    )) return;

    setPaying(true);
    try {
      await apiFetch('/api/admin/payouts', {
        method: 'POST',
        body: {
          sellerId: entry.sellerId,
          method,
          transferRef: transferRef.trim() || undefined,
          note: note.trim() || undefined,
        },
      });
      toast.success(method === 'paystack' ? 'Transfer initiated' : 'Payout recorded');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Payout failed');
    } finally {
      setPaying(false);
    }
  }

  return (
    <li className="rounded-2xl border border-border-soft bg-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-surface-1 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-fg">{entry.businessName}</p>
          <p className="text-xs text-fg-2 mt-0.5">
            {entry.bankName} · {entry.accountNumber}
            {entry.pendingBalance > 0 && (
              <span className="text-fg-3"> · {formatCurrency(entry.pendingBalance)} still pending</span>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-semibold text-fg leading-none">
            {formatCurrency(entry.availableBalance)}
          </p>
          <p className="text-[10px] text-fg-3 mt-1">available</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-fg-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-border-soft bg-surface-1">
          <div className="grid sm:grid-cols-2 gap-3 mb-4 mt-3">
            <div>
              <p className="text-[11px] text-fg-2 mb-1">Account name</p>
              <p className="text-sm text-fg">{entry.accountName}</p>
            </div>
            <div>
              <p className="text-[11px] text-fg-2 mb-1">Account number</p>
              <p className="text-sm text-fg font-mono">{entry.accountNumber}</p>
            </div>
          </div>

          {transfersEnabled ? (
            <div className="space-y-3">
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note (optional)"
              />
              <Button type="button" variant="default" size="tap" onClick={() => pay('paystack')} disabled={paying}>
                {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send {formatCurrency(entry.availableBalance)} via Paystack
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-fg-2">
                Send the money via your bank or the Paystack dashboard, then record it here.
              </p>
              <Input
                value={transferRef}
                onChange={(e) => setTransferRef(e.target.value)}
                placeholder="Bank/transfer reference (recommended)"
              />
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note (optional)"
              />
              <Button type="button" variant="default" size="tap" onClick={() => pay('manual')} disabled={paying}>
                {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4" />}
                Record {formatCurrency(entry.availableBalance)} as paid
              </Button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}