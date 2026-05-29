'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch, ApiError } from '@/lib/api-client';

interface RegisterResp {
  user: { id: string; email: string; name: string; role: string; profile_completed: boolean };
}

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<{ field?: string; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFieldError(null);

    try {
      await apiFetch<RegisterResp>('/api/auth/register', {
        method: 'POST',
        body: { name, email, password },
      });
      window.location.href = '/profile/complete';
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
      <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-3">Start shopping</p>
      <h1 className="font-display text-3xl font-semibold text-fg mb-2">Create account.</h1>
      <p className="text-sm text-fg-2 mb-7">Quality products at student-friendly prices.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-fg-1">Full name</Label>
          <Input id="name" type="text" autoComplete="name" value={name}
            onChange={(e) => setName(e.target.value)} required minLength={2}
            className="mt-1.5" placeholder="Your full name" />
          {fieldError?.field === 'name' && (<p className="text-xs text-danger mt-1">{fieldError.message}</p>)}
        </div>
        <div>
          <Label htmlFor="email" className="text-fg-1">Email</Label>
          <Input id="email" type="email" autoComplete="email" inputMode="email"
            value={email} onChange={(e) => setEmail(e.target.value)} required
            className="mt-1.5" placeholder="you@example.com" />
          {fieldError?.field === 'email' && (<p className="text-xs text-danger mt-1">{fieldError.message}</p>)}
        </div>
        <div>
          <Label htmlFor="password" className="text-fg-1">Password</Label>
          <Input id="password" type="password" autoComplete="new-password"
            value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
            className="mt-1.5" placeholder="At least 8 characters" />
          {fieldError?.field === 'password' ? (
            <p className="text-xs text-danger mt-1">{fieldError.message}</p>
          ) : (
            <p className="text-[11px] text-fg-3 mt-1.5">8+ characters with a letter and a number.</p>
          )}
        </div>

        <Button type="submit" variant="default" size="tap" className="w-full" disabled={submitting}>
          {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" />Creating account…</>) : 'Create account'}
        </Button>

        <p className="text-[11px] text-fg-3 text-center">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="text-primary hover:underline">Terms</Link> and{' '}
          <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>
      </form>

      <p className="text-sm text-fg-2 text-center mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-medium hover:text-primary-hover">Sign in</Link>
      </p>
    </div>
  );
}