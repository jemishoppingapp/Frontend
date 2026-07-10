import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Container } from '@/components/Container';
import { requireAuth } from '@/lib/session';
import { VerifyEmailForm } from './VerifyEmailForm';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Verify Email', robots: { index: false } };
export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const user = await requireAuth();
  const { from } = await searchParams;
  if (user.email_verified) redirect(from || '/');
  return (
    <Container className="py-12 sm:py-16 max-w-md">
      <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-3">One more step</p>
      <h1 className="font-display text-3xl font-semibold text-fg mb-2">Verify your email</h1>
      <p className="text-sm text-fg-2 mb-8">We sent a 6-digit code to <span className="font-medium text-fg">{user.email}</span>. Check your inbox (and spam).</p>
      <VerifyEmailForm from={from || '/'} />
    </Container>
  );
}