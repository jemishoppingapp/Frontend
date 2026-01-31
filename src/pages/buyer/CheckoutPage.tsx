import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { useCart } from '@/reusable/hooks/useCart';
import { useAuth } from '@/reusable/hooks/useAuth';
import CheckoutForm from '@/components/buyer/checkout/CheckoutForm';
import OrderSummary from '@/components/buyer/checkout/OrderSummary';
import EmptyCart from '@/components/buyer/cart/EmptyCart';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import type { ShippingFormData } from '@/reusable/utils/validators';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { isEmpty, clearCart, total } = useCart();
  const { isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyCart />
        </div>
      </div>
    );
  }

  const handleCheckoutComplete = async (data: {
    shipping: ShippingFormData;
    paymentMethod: 'paystack' | 'flutterwave';
  }) => {
    setIsProcessing(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In production:
      // 1. Create order via API
      // 2. Initialize payment
      // 3. Redirect to payment gateway

      toast.success('Order placed successfully!');
      clearCart();
      navigate('/orders');
    } catch (error) {
      toast.error('Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/cart"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <p className="text-sm text-gray-500">Complete your order</p>
          </div>
        </div>

        {/* Guest Checkout Notice */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 bg-blue-50 rounded-xl flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800">
                You're checking out as a guest.{' '}
                <Link to="/login?redirect=/checkout" className="font-medium underline">
                  Sign in
                </Link>{' '}
                for a faster checkout and to track your orders.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <CheckoutForm
              onComplete={handleCheckoutComplete}
              isLoading={isProcessing}
            />
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <OrderSummary compact showItems />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
