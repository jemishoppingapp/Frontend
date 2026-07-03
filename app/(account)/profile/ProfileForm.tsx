'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, LogOut, User, AtSign, Phone, PhoneCall,
  MapPin, GraduationCap, KeyRound, Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch, ApiError } from '@/lib/api-client';
import type { CurrentUser } from '@/lib/session';

/** One WhatsApp-style row: icon on the left, label + field on the right. */
function Row({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 px-5 py-4">
      <Icon className="h-5 w-5 text-fg-3 shrink-0 mt-2" aria-hidden />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

export function ProfileForm({ user }: { user: CurrentUser }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? '');
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
        body: { kind: 'profile', name, phone, nickname, alt_phone: altPhone, address, department },
      });
      toast.success('Profile saved');
      router.push('/');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Save failed');
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
      {/* Account — icon rows */}
      <form onSubmit={saveProfile} className="bg-surface-1 border border-border-soft rounded-2xl overflow-hidden">
        <div className="divide-y divide-border-soft">
          <Row icon={Mail}>
            <Label htmlFor="email" className="text-[11px] uppercase tracking-[0.15em] text-fg-3">Email</Label>
            <Input id="email" value={user.email} disabled className="mt-1 bg-surface" />
          </Row>
          <Row icon={User}>
            <Label htmlFor="name" className="text-[11px] uppercase tracking-[0.15em] text-fg-3">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 bg-surface" />
          </Row>
          <Row icon={AtSign}>
            <Label htmlFor="nickname" className="text-[11px] uppercase tracking-[0.15em] text-fg-3">Nickname (optional)</Label>
            <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} className="mt-1 bg-surface" />
          </Row>
          <Row icon={Phone}>
            <Label htmlFor="phone" className="text-[11px] uppercase tracking-[0.15em] text-fg-3">Primary phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" className="mt-1 bg-surface" />
            <p className="text-[11px] text-fg-3 mt-1">Nigerian number. We call this one about your orders.</p>
          </Row>
          <Row icon={PhoneCall}>
            <Label htmlFor="altPhone" className="text-[11px] uppercase tracking-[0.15em] text-fg-3">Alt phone (optional)</Label>
            <Input id="altPhone" value={altPhone} onChange={(e) => setAltPhone(e.target.value)} placeholder="08012345678" className="mt-1 bg-surface" />
          </Row>
          <Row icon={MapPin}>
            <Label htmlFor="address" className="text-[11px] uppercase tracking-[0.15em] text-fg-3">Address</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="On-campus or near-campus" className="mt-1 bg-surface" />
          </Row>
          <Row icon={GraduationCap}>
            <Label htmlFor="department" className="text-[11px] uppercase tracking-[0.15em] text-fg-3">Department</Label>
            <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Computer Science" className="mt-1 bg-surface" />
          </Row>
        </div>
        <div className="px-5 py-4 bg-surface border-t border-border-soft">
          <Button type="submit" variant="default" size="tap" className="w-full sm:w-auto" disabled={savingProfile}>
            {savingProfile ? (<><Loader2 className="h-4 w-4 animate-spin" />Saving…</>) : 'Save changes'}
          </Button>
        </div>
      </form>

      {/* Password */}
      <form onSubmit={savePassword} className="bg-surface-1 border border-border-soft rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 pt-5 pb-1">
          <KeyRound className="h-5 w-5 text-fg-3" aria-hidden />
          <h2 className="font-display text-base font-semibold text-fg">Change password</h2>
        </div>
        <div className="px-5 pb-5 pt-3 space-y-4">
          <div>
            <Label htmlFor="currentPassword" className="text-[11px] uppercase tracking-[0.15em] text-fg-3">Current password</Label>
            <Input id="currentPassword" type="password" autoComplete="current-password"
              value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1 bg-surface" />
            {passwordFieldError?.field === 'current_password' && (
              <p className="text-xs text-danger mt-1">{passwordFieldError.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="newPassword" className="text-[11px] uppercase tracking-[0.15em] text-fg-3">New password</Label>
            <Input id="newPassword" type="password" autoComplete="new-password"
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} className="mt-1 bg-surface" />
            {passwordFieldError?.field === 'new_password' ? (
              <p className="text-xs text-danger mt-1">{passwordFieldError.message}</p>
            ) : (
              <p className="text-[11px] text-fg-3 mt-1">8+ characters with a letter and a number.</p>
            )}
          </div>
          <div>
            <Label htmlFor="confirmPassword" className="text-[11px] uppercase tracking-[0.15em] text-fg-3">Confirm new password</Label>
            <Input id="confirmPassword" type="password" autoComplete="new-password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 bg-surface" />
            {passwordFieldError?.field === 'confirm_password' && (
              <p className="text-xs text-danger mt-1">{passwordFieldError.message}</p>
            )}
          </div>
          <Button type="submit" variant="default" size="tap"
            disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}>
            {savingPassword ? (<><Loader2 className="h-4 w-4 animate-spin" />Updating…</>) : 'Update password'}
          </Button>
        </div>
      </form>

      {/* Sign out — single tappable row, WhatsApp style */}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="w-full bg-surface-1 border border-border-soft rounded-2xl px-5 py-4 flex items-center gap-4 text-left hover:bg-surface-2 transition-colors disabled:opacity-60"
      >
        <LogOut className="h-5 w-5 text-danger shrink-0" aria-hidden />
        <span className="flex-1">
          <span className="block text-sm font-semibold text-danger">
            {signingOut ? 'Signing out…' : 'Sign out'}
          </span>
          <span className="block text-xs text-fg-3 mt-0.5">You&apos;ll be signed out on this device.</span>
        </span>
      </button>
    </div>
  );
}