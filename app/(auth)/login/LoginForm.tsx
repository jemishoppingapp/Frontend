'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch, ApiError } from '@/lib/api-client';

interface LoginResp {
  user: { id: string; email: string; name: string; role: string; profile_completed: boolean };
}

export function LoginForm({ fromPath }: { fromPath?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<{ field?: string; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFieldError(null);

    try {
      const data = await apiFetch<LoginResp>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      const next =
        fromPath && fromPath.startsWith('/') ? fromPath :
        !data.user.profile_completed ? '/profile/complete' :
        '/';
      window.location.href = next;
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.field) {
          setFieldError({ field: err.field, message: err.message });
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error('Something went wrong. Please try again.');
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-surface-1 border border-border-soft rounded-2xl p-7 sm:p-9">
      <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-3">Welcome back</p>
      <h1 className="font-display text-3xl font-semibold text-fg mb-2">Sign in.</h1>
      <p className="text-sm text-fg-2 mb-7">Use your JEMI email and password.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-fg-1">Email</Label>
          <Input id="email" type="email" autoComplete="email" inputMode="email"
            value={email} onChange={(e) => setEmail(e.target.value)} required
            className="mt-1.5" placeholder="you@example.com" />
          {fieldError?.field === 'email' && (
            <p className="text-xs text-danger mt-1">{fieldError.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password" className="text-fg-1">Password</Label>
          <Input id="password" type="password" autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)} required
            className="mt-1.5" placeholder="••••••••" />
          {fieldError?.field === 'password' && (
            <p className="text-xs text-danger mt-1">{fieldError.message}</p>
          )}
        </div>

        <Button type="submit" variant="default" size="tap" className="w-full" disabled={submitting}>
          {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" />Signing in…</>) : 'Sign in'}
        </Button>
      </form>

      <p className="text-sm text-fg-2 text-center mt-6">
        New to JEMI?{' '}
        <Link href="/register" className="text-primary font-medium hover:text-primary-hover">Create an account</Link>
      </p>
    </div>
  );
}