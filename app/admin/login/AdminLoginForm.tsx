'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch, ApiError } from '@/lib/api-client';

interface LoginResp {
  user: { id: string; email: string; name: string; role: string; profile_completed: boolean };
}

export function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = await apiFetch<LoginResp>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      // If this account isn't an admin, sign them out and refuse
      if (data.user.role !== 'admin') {
        // Best-effort logout to clear the cookie
        try {
          await apiFetch('/api/auth/logout', { method: 'POST' });
        } catch {}
        toast.error('This area is for staff only.');
        setSubmitting(false);
        return;
      }

      window.location.href = '/admin';
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-surface border border-border-soft rounded-2xl p-7 sm:p-9 shadow-sm">
      <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-3">
        <ShieldCheck className="h-3 w-3" />
        Staff access
      </div>
      <h1 className="font-display text-3xl font-semibold text-fg mb-2">Admin sign in.</h1>
      <p className="text-sm text-fg-2 mb-7">Restricted to authorized JEMI staff only.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-fg-1">Email</Label>
          <Input id="email" type="email" autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)} required
            className="mt-1.5 bg-surface" placeholder="admin@jemi.com" />
        </div>

        <div>
          <Label htmlFor="password" className="text-fg-1">Password</Label>
          <Input id="password" type="password" autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)} required
            className="mt-1.5 bg-surface" placeholder="••••••••" />
        </div>

        <Button type="submit" variant="default" size="tap" className="w-full" disabled={submitting}>
          {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" />Signing in…</>) : 'Sign in to admin'}
        </Button>
      </form>

      <p className="text-xs text-fg-3 text-center mt-6">
        Not staff? <Link href="/" className="text-primary hover:underline">Return to JEMI</Link>
      </p>
    </div>
  );
}