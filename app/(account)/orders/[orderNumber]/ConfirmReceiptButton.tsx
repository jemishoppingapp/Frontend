'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { apiFetch, ApiError } from '@/lib/api-client';

interface Props {
  orderNumber: string;
  canConfirm: boolean;            // status=ready_for_pickup, payment=paid, NOT yet confirmed
  buyerReceivedAt: Date | null;   // if already confirmed
  sellersHaveDelivered: boolean;  // at least one seller marked delivered
}

export function ConfirmReceiptButton({
  orderNumber, canConfirm, buyerReceivedAt, sellersHaveDelivered,
}: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function handleConfirm() {
    if (!confirm(
      `Confirm you have received your items from the seller(s)?\n\n` +
      `This releases the funds in escrow to the seller(s). ` +
      `If anything is wrong (damaged or missing), do NOT confirm — contact JEMI support first.`
    )) return;

    setConfirming(true);
    try {
      await apiFetch(`/api/orders/${orderNumber}/confirm-receipt`, { method: 'POST' });
      toast.success('Receipt confirmed. Thank you!');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not confirm');
    } finally {
      setConfirming(false);
    }
  }

  if (buyerReceivedAt) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-5 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-fg">You confirmed receipt</p>
          <p className="text-xs text-fg-2 mt-0.5">
            {new Date(buyerReceivedAt).toLocaleString('en-NG', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: 'numeric', minute: '2-digit',
            })}
          </p>
          <p className="text-xs text-fg-2 mt-2 leading-relaxed">
            If something is wrong with your order, you have 48 hours to report it.
            Contact JEMI support to dispute.
          </p>
        </div>
      </div>
    );
  }

  if (!canConfirm) return null;

  return (
    <div className="rounded-2xl border-2 border-primary-soft bg-primary-soft/30 p-5">
      <h3 className="font-display text-base font-semibold text-fg mb-2">Confirm receipt</h3>
      {sellersHaveDelivered ? (
        <p className="text-sm text-fg-2 mb-4">
          The seller has marked your items as delivered. Once you've received and inspected them at the pickup gate, tap below to confirm. This releases the payment to the seller.
        </p>
      ) : (
        <p className="text-sm text-fg-2 mb-4">
          Once you've received your items at the pickup gate, tap below to confirm receipt. This releases the payment to the seller.
        </p>
      )}
      <Button
        type="button" variant="default" size="tap"
        onClick={handleConfirm} disabled={confirming}
      >
        {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        Confirm receipt
      </Button>
      <p className="text-[11px] text-fg-3 mt-3 leading-relaxed">
        If you haven't picked up yet, wait until you have the items in hand before confirming.
        Don't confirm until you've actually received your items.
      </p>
    </div>
  );
}