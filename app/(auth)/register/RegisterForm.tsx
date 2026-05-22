'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not create account');

      // Account created + auto-signed in. Always go to profile complete
      // since they haven't filled it yet.
      window.location.href = '/profile/complete';
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-border-soft p-6 sm:p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
      <p className="text-sm text-gray-500 mb-6">
        Start shopping for quality products at student-friendly prices.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            className="mt-1"
            placeholder="Your full name"
          />
        </div>

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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="mt-1"
            placeholder="At least 8 characters"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use at least 8 characters with a letter and a number.
          </p>
        </div>

        <Button type="submit" variant="default" size="tap" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </Button>

        <p className="text-[11px] text-gray-500 text-center">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <p className="text-sm text-gray-600 text-center mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-medium hover:text-primary-hover">
          Sign in
        </Link>
      </p>
    </div>
  );
}