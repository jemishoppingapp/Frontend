import type { Metadata } from 'next';
import { Container } from '@/components/Container';
import { ForgotPasswordForm } from './ForgotPasswordForm';
export const metadata: Metadata = { title: 'Forgot Password', robots: { index: false } };
export default function ForgotPasswordPage() {
  return (
    <Container className="py-12 sm:py-16 max-w-md">
      <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-3">Account</p>
      <h1 className="font-display text-3xl font-semibold text-fg mb-2">Forgot password.</h1>
      <p className="text-sm text-fg-2 mb-8">Enter your email and we&apos;ll send a 6-digit reset code.</p>
      <ForgotPasswordForm />
    </Container>
  );
}