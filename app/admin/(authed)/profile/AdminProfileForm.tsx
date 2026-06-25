'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch, ApiError } from '@/lib/api-client';

interface Me {
  id: string;
  email: string;
  name: string;
  phone: string;
}

export function AdminProfileForm({ me }: { me: Me }) {
  const router = useRouter();

  const [name, setName] = useState(me.name);
  const [phone, setPhone] = useState(me.phone);
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await apiFetch(`/api/admin/users/${me.id}`, {
        method: 'PATCH',
        body: { kind: 'profile', name, phone, alt_phone: '', address: '', department: '', level: '' },
      });
      toast.success('Profile saved');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      toast.error('Password must contain a letter and a number.');
      return;
    }
    setChangingPassword(true);
    try {
      await apiFetch(`/api/admin/users/${me.id}`, {
        method: 'PATCH',
        body: { kind: 'password_reset', new_password: newPassword },
      });
      toast.success('Password changed. Use it next time you sign in.');
      setNewPassword('');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Change failed');
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={saveProfile} className="bg-surface border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-4">Account details</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-fg-1">Email</Label>
            <Input id="email" value={me.email} disabled className="mt-1.5 bg-surface-1" />
            <p className="text-[11px] text-fg-3 mt-1">Email can&apos;t be changed here.</p>
          </div>
          <div>
            <Label htmlFor="name" className="text-fg-1">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" required />
          </div>
          <div>
            <Label htmlFor="phone" className="text-fg-1">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5" />
          </div>
        </div>
        <div className="mt-5">
          <Button type="submit" variant="default" size="tap" disabled={savingProfile}>
            {savingProfile ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : 'Save profile'}
          </Button>
        </div>
      </form>

      <form onSubmit={changePassword} className="bg-surface border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-2 inline-flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-fg-2" /> Change password
        </h2>
        <p className="text-sm text-fg-2 mb-4">Set a new password for your own admin account.</p>
        <div>
          <Label htmlFor="newPassword" className="text-fg-1">New password</Label>
          <Input
            id="newPassword" type="password" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1.5" placeholder="At least 8 characters, a letter and a number"
          />
        </div>
        <div className="mt-5">
          <Button type="submit" variant="default" size="tap" disabled={changingPassword}>
            {changingPassword ? <><Loader2 className="h-4 w-4 animate-spin" />Changing…</> : 'Change password'}
          </Button>
        </div>
      </form>
    </div>
  );
}