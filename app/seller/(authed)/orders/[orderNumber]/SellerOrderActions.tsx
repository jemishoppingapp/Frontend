'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { apiFetch, ApiError } from '@/lib/api-client';

interface Props {
  orderNumber: string;
  canMarkDelivered: boolean;
  hasMarkedDelivered: boolean;
  status: string;
}

export function SellerOrderActions({
  orderNumber, canMarkDelivered, hasMarkedDelivered, status,
}: Props) {
  const router = useRouter();
  const [marking, setMarking] = useState(false);

  async function handleMarkDelivered() {
    if (!confirm(
      `Confirm you have handed over the items to the buyer at the pickup gate?\n\n` +
      `This records your half of the dual-confirm. Funds release once the buyer also confirms (or after 7 days).`
    )) return;

    setMarking(true);
    try {
      await apiFetch(`/api/seller/orders/${orderNumber}/mark-delivered`, { method: 'POST' });
      toast.success('Marked delivered. Buyer will confirm receipt next.');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not mark delivered');
    } finally {
      setMarking(false);
    }
  }

  function handlePrintSlip() {
    // Open the PDF in a new tab — browser opens it inline or downloads
    window.open(`/api/seller/orders/${orderNumber}/pickup-slip.pdf`, '_blank', 'noopener');
  }

  return (
    <div className="bg-surface border border-border-soft rounded-2xl p-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-fg-2 font-medium mb-3">Actions</p>
      <div className="flex flex-wrap gap-2">
        {canMarkDelivered && (
          <Button
            type="button"
            variant="default"
            size="tap"
            onClick={handleMarkDelivered}
            disabled={marking}
          >
            {marking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Mark delivered
          </Button>
        )}
        {hasMarkedDelivered && (
          <div className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg bg-success/10 text-success text-sm font-medium">
            <Check className="h-4 w-4" />
            You marked delivered
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="tap"
          onClick={handlePrintSlip}
        >
          <Printer className="h-4 w-4" />
          Print pickup slip
        </Button>
      </div>
      {!canMarkDelivered && !hasMarkedDelivered && status !== 'ready_for_pickup' && (
        <p className="text-[11px] text-fg-3 mt-3">
          The "Mark delivered" button activates once admin marks this order as ready for pickup.
        </p>
      )}
    </div>
  );
}