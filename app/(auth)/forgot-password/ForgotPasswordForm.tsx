'use client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch, ApiError } from '@/lib/api-client';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetch('/api/auth/forgot-password', { method: 'POST', body: { email: email.trim() } });
      toast.success('If that email has an account, a code is on the way.');
      window.location.href = `/reset-password?email=${encodeURIComponent(email.trim())}`;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong.');
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="email" className="text-fg-1">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5" placeholder="you@example.com" />
      </div>
      <Button type="submit" variant="default" size="tap" className="w-full" disabled={busy || !email.trim()}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send reset code'}
      </Button>
    </form>
  );
}