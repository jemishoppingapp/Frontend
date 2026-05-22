'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CurrentUser } from '@/lib/session';

export function ProfileForm({ user }: { user: CurrentUser }) {
  const router = useRouter();

  // Basic fields
  const [name, setName] = useState(user.name);
  const [nickname, setNickname] = useState(user.nickname ?? '');
  const [altPhone, setAltPhone] = useState(user.alt_phone ?? '');
  const [address, setAddress] = useState(user.address ?? '');
  const [department, setDepartment] = useState(user.department ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [signingOut, setSigningOut] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'profile',
          name,
          nickname,
          alt_phone: altPhone,
          address,
          department,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      toast.success('Profile saved');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingPassword(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'password',
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password change failed');
      toast.success('Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Password change failed');
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch {
      setSigningOut(false);
      toast.error('Could not sign out');
    }
  }

  return (
    <div className="space-y-6">
      {/* Account basics */}
      <form
        onSubmit={saveProfile}
        className="border border-border-soft rounded-lg bg-white p-5 sm:p-6"
      >
        <h2 className="text-base font-semibold text-gray-900 mb-4">Account details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled className="mt-1" />
            <p className="text-[11px] text-gray-500 mt-1">Email can't be changed.</p>
          </div>
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="nickname">Nickname (optional)</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">Primary phone</Label>
            <Input id="phone" value={user.phone || 'Not set'} disabled className="mt-1" />
            <p className="text-[11px] text-gray-500 mt-1">
              Update via{' '}
              <a href="/profile/complete" className="text-primary hover:underline">
                profile completion
              </a>
              .
            </p>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="altPhone">Alt phone (optional)</Label>
            <Input
              id="altPhone"
              value={altPhone}
              onChange={(e) => setAltPhone(e.target.value)}
              placeholder="08012345678"
              className="mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="On-campus or near-campus address"
              className="mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Computer Science"
              className="mt-1"
            />
          </div>
        </div>
        <div className="mt-5">
          <Button type="submit" variant="default" size="tap" disabled={savingProfile}>
            {savingProfile ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </div>
      </form>

      {/* Change password */}
      <form
        onSubmit={savePassword}
        className="border border-border-soft rounded-lg bg-white p-5 sm:p-6"
      >
        <h2 className="text-base font-semibold text-gray-900 mb-4">Change password</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              className="mt-1"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              At least 8 characters with a letter and a number.
            </p>
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <div className="mt-5">
          <Button
            type="submit"
            variant="default"
            size="tap"
            disabled={
              savingPassword ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
          >
            {savingPassword ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating…
              </>
            ) : (
              'Update password'
            )}
          </Button>
        </div>
      </form>

      {/* Sign out */}
      <div className="border border-border-soft rounded-lg bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Sign out</h2>
        <p className="text-sm text-gray-500 mb-4">
          You'll be signed out on this device.
        </p>
        <Button
          type="button"
          variant="outline"
          size="tap"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          <LogOut className="h-4 w-4" />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </Button>
      </div>
    </div>
  );
}