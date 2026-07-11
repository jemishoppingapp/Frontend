import type { Metadata } from 'next';
import { Container } from '@/components/Container';
import { ResetPasswordForm } from './ResetPasswordForm';
export const metadata: Metadata = { title: 'Reset Password', robots: { index: false } };
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  return (
    <Container className="py-12 sm:py-16 max-w-md">
      <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-3">Account</p>
      <h1 className="font-display text-3xl font-semibold text-fg mb-2">Reset password.</h1>
      <p className="text-sm text-fg-2 mb-8">Enter the 6-digit code from your email and choose a new password.</p>
      <ResetPasswordForm initialEmail={email || ''} />
    </Container>
  );
}