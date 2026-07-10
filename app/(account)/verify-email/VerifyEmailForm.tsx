'use client';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch, ApiError } from '@/lib/api-client';

export function VerifyEmailForm({ from }: { from: string }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().length !== 6) { toast.error('Enter the 6-digit code.'); return; }
    setBusy(true);
    try {
      await apiFetch('/api/auth/verify-email', { method: 'POST', body: { code: code.trim() } });
      toast.success('Email verified!');
      window.location.href = from;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Verification failed');
      setBusy(false);
    }
  }

  async function resend() {
    setBusy(true);
    try {
      await apiFetch('/api/auth/resend-otp', { method: 'POST' });
      toast.success('New code sent');
      setCooldown(60);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not resend');
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={verify} className="space-y-4">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        inputMode="numeric" autoComplete="one-time-code" placeholder="000000"
        className="text-center text-2xl tracking-[0.5em] font-mono h-14"
      />
      <Button type="submit" variant="default" size="tap" className="w-full" disabled={busy || code.length !== 6}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
      </Button>
      <button type="button" onClick={resend} disabled={busy || cooldown > 0}
        className="w-full text-sm text-fg-2 hover:text-fg disabled:opacity-50 py-2">
        {cooldown > 0 ? `Resend code in ${cooldown}s` : "Didn't get it? Resend code"}
      </button>
    </form>
  );
}