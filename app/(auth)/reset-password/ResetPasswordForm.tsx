'use client';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch, ApiError } from '@/lib/api-client';

export function ResetPasswordForm({ initialEmail }: { initialEmail: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        body: { email: email.trim(), code: code.trim(), new_password: password },
      });
      toast.success('Password reset. Sign in with your new password.');
      window.location.href = '/login';
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Reset failed.');
      setBusy(false);
    }
  }
  async function resend() {
    if (!email.trim()) { toast.error('Enter your email first.'); return; }
    setBusy(true);
    try {
      await apiFetch('/api/auth/forgot-password', { method: 'POST', body: { email: email.trim() } });
      toast.success('If that email has an account, a new code is on the way.');
      setCooldown(60);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not resend.');
    } finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="email" className="text-fg-1">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="code" className="text-fg-1">6-digit code</Label>
        <Input id="code" value={code} inputMode="numeric" autoComplete="one-time-code"
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="mt-1.5 text-center text-xl tracking-[0.4em] font-mono" placeholder="000000" />
      </div>
      <div>
        <Label htmlFor="password" className="text-fg-1">New password</Label>
        <Input id="password" type="password" autoComplete="new-password" value={password}
          onChange={(e) => setPassword(e.target.value)} minLength={8} required className="mt-1.5" />
        <p className="text-[11px] text-fg-3 mt-1">8+ characters with a letter and a number.</p>
      </div>
      <Button type="submit" variant="default" size="tap" className="w-full" disabled={busy || code.length !== 6 || !password}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reset password'}
      </Button>
      <button type="button" onClick={resend} disabled={busy || cooldown > 0}
        className="w-full text-sm text-fg-2 hover:text-fg disabled:opacity-50 py-2">
        {cooldown > 0 ? `Resend code in ${cooldown}s` : "Didn't get a code? Resend"}
      </button>
    </form>
  );
}