'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { apiFetch, ApiError } from '@/lib/api-client';

interface Props {
  orderNumber: string;
  canRefund: boolean;       // paid + not already refunded
  alreadyRefunded: boolean;
}

export function AdminRefundButton({ orderNumber, canRefund, alreadyRefunded }: Props) {
  const router = useRouter();
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [refunding, setRefunding] = useState(false);

  if (alreadyRefunded) {
    return (
      <div className="rounded-2xl border border-fg-3/30 bg-surface-1 p-4 text-sm text-fg-2">
        Refund has been initiated for this order via Paystack. Settlement typically takes 5–10 business days.
      </div>
    );
  }

  if (!canRefund) return null;

  async function handleRefund() {
    if (reason.trim().length < 5) {
      toast.error('Please provide a reason (at least 5 characters).');
      return;
    }
    if (!confirm(
      `Initiate Paystack refund for this order?\n\nReason: "${reason.trim()}"\n\nThis cannot be undone. Paystack will process the refund in 5–10 business days.`
    )) return;

    setRefunding(true);
    try {
      await apiFetch(`/api/admin/orders/${orderNumber}/refund`, {
        method: 'POST',
        body: { reason: reason.trim() },
      });
      toast.success('Refund initiated. Paystack will process it within 5–10 business days.');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Refund failed');
    } finally {
      setRefunding(false);
    }
  }

  if (!reasonOpen) {
    return (
      <div className="bg-surface border border-border-soft rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-fg-2 font-medium mb-2">Refund</p>
        <p className="text-sm text-fg-2 mb-4">
          Initiate a Paystack refund for this order. Use this for cancelled or disputed orders.
        </p>
        <Button type="button" variant="outline" size="tap"
          onClick={() => setReasonOpen(true)}
          className="text-danger hover:bg-danger/5">
          <Undo2 className="h-4 w-4" />
          Initiate refund
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border-soft rounded-2xl p-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-fg-2 font-medium mb-2">Refund reason</p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        maxLength={500}
        placeholder="e.g. Order cancelled at buyer's request; seller failed to deliver"
        className="w-full px-3 py-2 rounded-md border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-3"
      />
      <div className="flex gap-2">
        <Button type="button" variant="default" size="tap"
          onClick={handleRefund} disabled={refunding || reason.trim().length < 5}
          className="text-danger">
          {refunding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Undo2 className="h-4 w-4" />}
          Confirm refund
        </Button>
        <Button type="button" variant="outline" size="tap"
          onClick={() => { setReasonOpen(false); setReason(''); }}>
          Cancel
        </Button>
      </div>
    </div>
  );
}