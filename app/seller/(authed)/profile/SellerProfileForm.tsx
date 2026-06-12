'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch, ApiError } from '@/lib/api-client';

interface UserData { email: string; name: string; phone: string; }
interface SellerData {
  businessName: string;
  businessTypeCategory: string;
  businessTypeNotes: string;
  businessAddress: string;
  businessPhone: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  platformFeePercent: string;
}

export function SellerProfileForm({ user, seller }: { user: UserData; seller: SellerData }) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState(seller.businessName);
  const [businessTypeNotes, setBusinessTypeNotes] = useState(seller.businessTypeNotes);
  const [businessAddress, setBusinessAddress] = useState(seller.businessAddress);
  const [businessPhone, setBusinessPhone] = useState(seller.businessPhone);
  const [saving, setSaving] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordFieldError, setPasswordFieldError] = useState<{ field?: string; message: string } | null>(null);

  async function saveBusiness(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/api/seller/profile', {
        method: 'PATCH',
        body: {
          kind: 'business',
          businessName,
          businessTypeNotes,
          businessAddress,
          businessPhone,
        },
      });
      toast.success('Profile saved');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordFieldError(null);
    try {
      await apiFetch('/api/user/profile', {
        method: 'PATCH',
        body: {
          kind: 'password',
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
      });
      toast.success('Password updated');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.field) setPasswordFieldError({ field: err.field, message: err.message });
        else toast.error(err.message);
      } else {
        toast.error('Password change failed');
      }
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Account */}
      <section className="bg-surface border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-2">Account</h2>
        <p className="text-xs text-fg-2 mb-5">
          To change your name or phone, see <a href="/profile" className="text-primary hover:underline">your personal profile</a>.
        </p>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><dt className="text-fg-2 text-xs mb-0.5">Email</dt><dd className="text-fg font-mono">{user.email}</dd></div>
          <div><dt className="text-fg-2 text-xs mb-0.5">Name</dt><dd className="text-fg">{user.name}</dd></div>
          <div className="sm:col-span-2"><dt className="text-fg-2 text-xs mb-0.5">Phone</dt><dd className="text-fg">{user.phone || '—'}</dd></div>
        </dl>
      </section>

      {/* Business */}
      <form onSubmit={saveBusiness} className="bg-surface border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-5">Business</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="businessName" className="text-fg-1">Business name</Label>
            <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required minLength={2}
              className="mt-1.5 bg-surface" />
          </div>
          <div>
            <Label className="text-fg-1">Category</Label>
            <div className="mt-1.5 h-11 px-3 flex items-center rounded-md border border-border bg-surface-1 text-sm text-fg capitalize">
              {seller.businessTypeCategory}
              <Lock className="h-3 w-3 ml-2 text-fg-3" />
            </div>
            <p className="text-[11px] text-fg-3 mt-1">Category set when you applied. Contact admin to change.</p>
          </div>
          <div>
            <Label htmlFor="businessTypeNotes" className="text-fg-1">Description (optional)</Label>
            <Input id="businessTypeNotes" value={businessTypeNotes} onChange={(e) => setBusinessTypeNotes(e.target.value)}
              maxLength={500} className="mt-1.5 bg-surface" />
          </div>
          <div>
            <Label htmlFor="businessAddress" className="text-fg-1">Business address</Label>
            <Input id="businessAddress" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} required minLength={5}
              className="mt-1.5 bg-surface" />
          </div>
          <div>
            <Label htmlFor="businessPhone" className="text-fg-1">Business phone</Label>
            <Input id="businessPhone" type="tel" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} required
              className="mt-1.5 bg-surface" />
          </div>
        </div>
        <div className="mt-5">
          <Button type="submit" variant="default" size="tap" disabled={saving}>
            {saving ? (<><Loader2 className="h-4 w-4 animate-spin" />Saving…</>) : 'Save business info'}
          </Button>
        </div>
      </form>

      {/* Bank — locked */}
      <section className="bg-surface border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-2">Payout bank</h2>
        <p className="text-xs text-fg-2 mb-5">
          To change bank info (for payout security), contact JEMI admin.
        </p>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><dt className="text-fg-2 text-xs mb-0.5">Bank</dt><dd className="text-fg">{seller.bankName}</dd></div>
          <div><dt className="text-fg-2 text-xs mb-0.5">Account number</dt><dd className="text-fg font-mono">{seller.bankAccountNumber}</dd></div>
          <div className="sm:col-span-2"><dt className="text-fg-2 text-xs mb-0.5">Account name</dt><dd className="text-fg">{seller.bankAccountName}</dd></div>
          <div><dt className="text-fg-2 text-xs mb-0.5">Platform fee</dt><dd className="text-fg">{seller.platformFeePercent}%</dd></div>
        </dl>
      </section>

      {/* Password */}
      <form onSubmit={savePassword} className="bg-surface border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-5">Change password</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="currentPassword" className="text-fg-1">Current password</Label>
            <Input id="currentPassword" type="password" autoComplete="current-password"
              value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1.5 bg-surface" />
            {passwordFieldError?.field === 'current_password' && (
              <p className="text-xs text-danger mt-1">{passwordFieldError.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="newPassword" className="text-fg-1">New password</Label>
            <Input id="newPassword" type="password" autoComplete="new-password"
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8}
              className="mt-1.5 bg-surface" />
            {passwordFieldError?.field === 'new_password' ? (
              <p className="text-xs text-danger mt-1">{passwordFieldError.message}</p>
            ) : (
              <p className="text-[11px] text-fg-3 mt-1">8+ characters with a letter and a number.</p>
            )}
          </div>
          <div>
            <Label htmlFor="confirmPassword" className="text-fg-1">Confirm new password</Label>
            <Input id="confirmPassword" type="password" autoComplete="new-password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1.5 bg-surface" />
            {passwordFieldError?.field === 'confirm_password' && (
              <p className="text-xs text-danger mt-1">{passwordFieldError.message}</p>
            )}
          </div>
        </div>
        <div className="mt-5">
          <Button type="submit" variant="default" size="tap"
            disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}>
            {savingPassword ? (<><Loader2 className="h-4 w-4 animate-spin" />Updating…</>) : 'Update password'}
          </Button>
        </div>
      </form>
    </div>
  );
}