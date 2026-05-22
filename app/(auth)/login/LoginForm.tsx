'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm({ fromPath }: { fromPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sign-in failed');

      // Where to go after login:
      //   - explicit ?from= param (e.g. came from /checkout)
      //   - else profile-complete if not done
      //   - else home
      const next =
        fromPath && fromPath.startsWith('/')
          ? fromPath
          : !data.user.profile_completed
          ? '/profile/complete'
          : '/';

      // Use a hard navigation so the new cookie is reflected everywhere
      window.location.href = next;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-border-soft p-6 sm:p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
      <p className="text-sm text-gray-500 mb-6">Sign in to your JEMI account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1"
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" variant="default" size="tap" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <p className="text-sm text-gray-600 text-center mt-6">
        New to JEMI?{' '}
        <Link href="/register" className="text-primary font-medium hover:text-primary-hover">
          Create an account
        </Link>
      </p>
    </div>
  );
}