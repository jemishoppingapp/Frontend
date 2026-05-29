'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch, ApiError } from '@/lib/api-client';
import type { CurrentUser } from '@/lib/session';

export function ProfileForm({ user }: { user: CurrentUser }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [nickname, setNickname] = useState(user.nickname ?? '');
  const [altPhone, setAltPhone] = useState(user.alt_phone ?? '');
  const [address, setAddress] = useState(user.address ?? '');
  const [department, setDepartment] = useState(user.department ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordFieldError, setPasswordFieldError] = useState<{ field?: string; message: string } | null>(null);

  const [signingOut, setSigningOut] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await apiFetch<{ saved: boolean }>('/api/user/profile', {
        method: 'PATCH',
        body: { kind: 'profile', name, nickname, alt_phone: altPhone, address, department },
      });
      toast.success('Profile saved');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordFieldError(null);
    try {
      await apiFetch<{ saved: boolean }>('/api/user/profile', {
        method: 'PATCH',
        body: { kind: 'password', current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword },
      });
      toast.success('Password updated');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.field) {
          setPasswordFieldError({ field: err.field, message: err.message });
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error('Password change failed');
      }
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch {
      setSigningOut(false);
      toast.error('Could not sign out');
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={saveProfile} className="bg-surface-1 border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-5">Account details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email" className="text-fg-1">Email</Label>
            <Input id="email" value={user.email} disabled className="mt-1.5 bg-surface" />
            <p className="text-[11px] text-fg-3 mt-1">Email can't be changed.</p>
          </div>
          <div>
            <Label htmlFor="name" className="text-fg-1">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1.5 bg-surface" />
          </div>
          <div>
            <Label htmlFor="nickname" className="text-fg-1">Nickname (optional)</Label>
            <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} className="mt-1.5 bg-surface" />
          </div>
          <div>
            <Label htmlFor="phone" className="text-fg-1">Primary phone</Label>
            <Input id="phone" value={user.phone || 'Not set'} disabled className="mt-1.5 bg-surface" />
            <p className="text-[11px] text-fg-3 mt-1">
              Update via <a href="/profile/complete" className="text-primary hover:underline">profile completion</a>.
            </p>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="altPhone" className="text-fg-1">Alt phone (optional)</Label>
            <Input id="altPhone" value={altPhone} onChange={(e) => setAltPhone(e.target.value)} placeholder="08012345678" className="mt-1.5 bg-surface" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="address" className="text-fg-1">Address</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="On-campus or near-campus" className="mt-1.5 bg-surface" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="department" className="text-fg-1">Department</Label>
            <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Computer Science" className="mt-1.5 bg-surface" />
          </div>
        </div>
        <div className="mt-5">
          <Button type="submit" variant="default" size="tap" disabled={savingProfile}>
            {savingProfile ? (<><Loader2 className="h-4 w-4 animate-spin" />Saving…</>) : 'Save changes'}
          </Button>
        </div>
      </form>

      <form onSubmit={savePassword} className="bg-surface-1 border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-5">Change password</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="currentPassword" className="text-fg-1">Current password</Label>
            <Input id="currentPassword" type="password" autoComplete="current-password"
              value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1.5 bg-surface" />
            {passwordFieldError?.field === 'current_password' && (
              <p className="text-xs text-danger mt-1">{passwordFieldError.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="newPassword" className="text-fg-1">New password</Label>
            <Input id="newPassword" type="password" autoComplete="new-password"
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} className="mt-1.5 bg-surface" />
            {passwordFieldError?.field === 'new_password' ? (
              <p className="text-xs text-danger mt-1">{passwordFieldError.message}</p>
            ) : (
              <p className="text-[11px] text-fg-3 mt-1">8+ characters with a letter and a number.</p>
            )}
          </div>
          <div>
            <Label htmlFor="confirmPassword" className="text-fg-1">Confirm new password</Label>
            <Input id="confirmPassword" type="password" autoComplete="new-password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1.5 bg-surface" />
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

      <div className="bg-surface-1 border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-1">Sign out</h2>
        <p className="text-sm text-fg-2 mb-4">You'll be signed out on this device.</p>
        <Button type="button" variant="outline" size="tap" onClick={handleSignOut} disabled={signingOut}>
          <LogOut className="h-4 w-4" />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </Button>
      </div>
    </div>
  );
}