import type { Metadata } from 'next';
import { requireAuth } from '@/lib/session';
import { CheckoutForm } from './CheckoutForm';
import { Container } from '@/components/Container';

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false },
};

export default async function CheckoutPage() {
  const user = await requireAuth('/checkout');

  return (
    <Container className="py-6 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Checkout
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Confirm your details and pay securely with Paystack.
      </p>
      <CheckoutForm
        user={{ id: user.id, email: user.email, name: user.name }}
      />
    </Container>
  );
}