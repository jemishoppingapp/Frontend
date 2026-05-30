'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';

/**
 * Valid status transitions:
 *   pending → cancelled
 *   confirmed → processing | cancelled
 *   processing → ready_for_pickup | cancelled
 *   ready_for_pickup → completed
 *   completed → (none — terminal)
 *   cancelled → (none — terminal)
 */
const TRANSITIONS: Record<string, Array<{ to: string; label: string; variant: 'primary' | 'danger' }>> = {
  pending: [
    { to: 'cancelled', label: 'Cancel order', variant: 'danger' },
  ],
  confirmed: [
    { to: 'processing', label: 'Mark processing', variant: 'primary' },
    { to: 'cancelled', label: 'Cancel order', variant: 'danger' },
  ],
  processing: [
    { to: 'ready_for_pickup', label: 'Mark ready for pickup', variant: 'primary' },
    { to: 'cancelled', label: 'Cancel order', variant: 'danger' },
  ],
  ready_for_pickup: [
    { to: 'completed', label: 'Mark completed', variant: 'primary' },
  ],
  completed: [],
  cancelled: [],
};

export function AdminOrderStatusActions({
  orderNumber, status, paymentStatus,
}: {
  orderNumber: string; status: string; paymentStatus: string;
}) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);

  const transitions = TRANSITIONS[status] ?? [];

  if (transitions.length === 0) {
    return (
      <div className="bg-surface border border-border-soft rounded-2xl p-5 text-sm text-fg-2">
        This order is{' '}
        <span className="font-medium text-fg">{status === 'completed' ? 'completed' : 'cancelled'}</span>. No further actions available.
      </div>
    );
  }

  async function handleTransition(to: string, label: string) {
    if (!confirm(`Confirm: ${label}?`)) return;
    setUpdating(to);
    try {
      await apiFetch(`/api/admin/orders/${orderNumber}/status`, {
        method: 'POST',
        body: { status: to },
      });
      toast.success(`Order ${label.toLowerCase()}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update order');
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="bg-surface border border-border-soft rounded-2xl p-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-fg-2 font-medium mb-3">Update status</p>
      {paymentStatus !== 'paid' && status !== 'pending' && (
        <p className="text-xs text-warning mb-3">
          Note: payment is not confirmed yet. Be careful with status changes.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {transitions.map((t) => (
          <button
            key={t.to}
            type="button"
            onClick={() => handleTransition(t.to, t.label)}
            disabled={updating !== null}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-xs font-medium transition-colors disabled:opacity-50',
              t.variant === 'primary'
                ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
                : 'bg-surface border border-border text-danger hover:bg-danger/5'
            )}
          >
            {updating === t.to && <Loader2 className="h-3 w-3 animate-spin" />}
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}