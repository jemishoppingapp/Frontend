import type { Metadata } from 'next';
import { CartPageContent } from './CartPageContent';

export const metadata: Metadata = {
  title: 'Your Cart',
  robots: { index: false },
};

export default function CartPage() {
  return <CartPageContent />;
}