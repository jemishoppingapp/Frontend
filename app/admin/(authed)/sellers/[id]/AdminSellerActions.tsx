'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck, Ban, RotateCcw, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { apiFetch, ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';

/**
 * Valid status transitions:
 *   pending     -> approved | rejected
 *   approved    -> suspended
 *   suspended   -> approved (reinstate)
 *   rejected    -> approved (admin can override prior rejection)
 */
const TRANSITIONS: Record<string, Array<{
  to: string;
  label: string;
  variant: 'primary' | 'danger' | 'outline';
  needsReason?: boolean;
  confirmMsg: string;
}>> = {
  pending: [
    { to: 'approved', label: 'Approve', variant: 'primary',
      confirmMsg: 'Approve this seller? They will be able to list products immediately.' },
    { to: 'rejected', label: 'Reject', variant: 'danger', needsReason: true,
      confirmMsg: 'Reject this seller? They will see your reason on their pending page.' },
  ],
  approved: [
    { to: 'suspended', label: 'Suspend', variant: 'danger',
      confirmMsg: 'Suspend this seller? All their active products will be hidden from buyers immediately.' },
  ],
  suspended: [
    { to: 'approved', label: 'Reinstate', variant: 'primary',
      confirmMsg: 'Reinstate this seller? Their products will be restored, but admin will need to re-activate each one individually.' },
  ],
  rejected: [
    { to: 'approved', label: 'Approve (override rejection)', variant: 'outline',
      confirmMsg: 'Approve this previously-rejected seller? They will be able to list products immediately.' },
  ],
};

export function AdminSellerActions({
  sellerId, status, businessName, activeProductCount,
}: {
  sellerId: string;
  status: string;
  businessName: string;
  activeProductCount: number;
}) {
  const router = useRouter();
  const [working, setWorking] = useState<string | null>(null);
  const [reasonInput, setReasonInput] = useState('');
  const [reasonOpenFor, setReasonOpenFor] = useState<string | null>(null);

  const transitions = TRANSITIONS[status] ?? [];

  async function performTransition(to: string, reason?: string) {
    setWorking(to);
    try {
      await apiFetch(`/api/admin/sellers/${sellerId}/status`, {
        method: 'POST',
        body: { status: to, ...(reason ? { rejection_reason: reason } : {}) },
      });
      toast.success(`Seller ${to === 'approved' ? 'approved' :
                     to === 'rejected' ? 'rejected' :
                     to === 'suspended' ? 'suspended' :
                     'updated'}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update seller');
    } finally {
      setWorking(null);
      setReasonInput('');
      setReasonOpenFor(null);
    }
  }

  async function handleClick(t: typeof transitions[number]) {
    if (t.needsReason) {
      setReasonOpenFor(t.to);
      return;
    }
    let confirmMsg = t.confirmMsg;
    if (t.to === 'suspended' && activeProductCount > 0) {
      confirmMsg += `\n\n${activeProductCount} active product${activeProductCount === 1 ? '' : 's'} will be hidden.`;
    }
    if (!confirm(confirmMsg)) return;
    await performTransition(t.to);
  }

  async function handleReasonSubmit() {
    if (reasonInput.trim().length < 5) {
      toast.error('Please provide a brief reason (at least 5 characters).');
      return;
    }
    if (!reasonOpenFor) return;
    if (!confirm(`Reject "${businessName}" with this reason?\n\n"${reasonInput.trim()}"`)) return;
    await performTransition(reasonOpenFor, reasonInput.trim());
  }

  if (transitions.length === 0) {
    return (
      <div className="bg-surface border border-border-soft rounded-2xl p-5 text-sm text-fg-2">
        This seller is{' '}
        <span className="font-medium text-fg capitalize">{status}</span>. No further actions available.
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border-soft rounded-2xl p-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-fg-2 font-medium mb-3">Actions</p>
      <div className="flex flex-wrap gap-2">
        {transitions.map((t) => {
          const Icon = t.to === 'approved' ? ShieldCheck
                     : t.to === 'rejected' ? XCircle
                     : t.to === 'suspended' ? Ban
                     : RotateCcw;
          return (
            <Button
              key={t.to}
              type="button"
              variant={t.variant === 'primary' ? 'default' : 'outline'}
              size="tap"
              onClick={() => handleClick(t)}
              disabled={working !== null}
              className={cn(t.variant === 'danger' && 'text-danger hover:bg-danger/5')}
            >
              {working === t.to ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
              {t.label}
            </Button>
          );
        })}
      </div>

      {reasonOpenFor === 'rejected' && (
        <div className="mt-4 pt-4 border-t border-border-soft">
          <label htmlFor="rejection-reason" className="text-sm font-medium text-fg mb-2 block">
            Why are you rejecting this seller?
          </label>
          <textarea
            id="rejection-reason"
            value={reasonInput}
            onChange={(e) => setReasonInput(e.target.value)}
            rows={3}
            placeholder="e.g. Bank account name doesn't match business name; please reapply with consistent info."
            className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            maxLength={500}
          />
          <p className="text-[11px] text-fg-3 mt-1">
            The seller will see this reason on their pending page.
          </p>
          <div className="mt-3 flex gap-2">
            <Button type="button" variant="default" size="tap"
              onClick={handleReasonSubmit}
              disabled={working !== null || reasonInput.trim().length < 5}
              className="text-danger">
              {working === 'rejected' ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Confirm rejection
            </Button>
            <Button type="button" variant="outline" size="tap"
              onClick={() => { setReasonOpenFor(null); setReasonInput(''); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}