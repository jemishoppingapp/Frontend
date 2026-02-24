import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { paymentApi } from '@/services/api/paymentApi';
import { getErrorMessage } from '@/services/api/client';
import { useCartStore } from '@/store/cartStore';

interface OrderConfirmation {
  orderNumber: string;
  pickupCode: string;
  pickupLocation: string;
  total: string;
}

export default function CheckoutVerifyPage() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [order, setOrder] = useState<OrderConfirmation | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { clearCart } = useCartStore();

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setErrorMessage('No payment reference found. Please try again.');
        setStatus('failed');
        return;
      }

      try {
        const result = await paymentApi.verifyPayment(reference);

        if (result.status === 'success') {
          setOrder({
            orderNumber: result.order_number,
            pickupCode: result.pickup_code,
            pickupLocation: result.pickup_location,
            total: result.total,
          });
          // Ensure local cart is cleared after successful payment
          clearCart();
          setStatus('success');
        } else {
          setErrorMessage('Payment was not successful. If money was deducted, it will be refunded.');
          setStatus('failed');
        }
      } catch (err: unknown) {
        const message = getErrorMessage(err);
        setErrorMessage(message);
        setStatus('failed');
      }
    };

    verifyPayment();
  }, [reference, clearCart]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto" />
          <p className="mt-4 text-gray-600">Verifying your payment...</p>
          <p className="mt-1 text-xs text-gray-400">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Payment Failed</h1>
            <p className="mt-2 text-gray-500">
              {errorMessage || "We couldn't verify your payment. If money was deducted, it will be refunded automatically."}
            </p>
            <div className="mt-6 space-y-3">
              <Link
                to="/cart"
                className="block w-full rounded-lg bg-gray-900 px-6 py-3 text-base font-medium text-white hover:bg-gray-800 text-center"
              >
                Back to Cart
              </Link>
              <Link
                to="/orders"
                className="block text-sm text-green-600 hover:text-green-500"
              >
                Check your orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Order Confirmed!</h1>
          <p className="mt-2 text-gray-500">Thank you for your purchase.</p>

          {order && (
            <div className="mt-6 space-y-4">
              {/* Order Number */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="text-lg font-bold text-gray-900">#{order.orderNumber}</p>
              </div>

              {/* Pickup Code — the important one */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <p className="text-sm text-green-700 font-medium">Your Pickup Code</p>
                <p className="text-4xl font-bold text-green-700 tracking-widest mt-2">
                  {order.pickupCode}
                </p>
                <p className="text-xs text-green-600 mt-2">
                  Show this code when collecting your order
                </p>
              </div>

              {/* Pickup Location */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Pickup Location</p>
                <p className="text-base font-medium text-gray-900">📍 {order.pickupLocation}</p>
                <p className="text-xs text-gray-400 mt-1">
                  You'll be notified when your order is ready for pickup
                </p>
              </div>

              {/* Total */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Paid</p>
                <p className="text-lg font-bold text-gray-900">{order.total}</p>
              </div>
            </div>
          )}

          <div className="mt-8 space-y-3">
            <Link
              to="/orders"
              className="block w-full rounded-lg bg-gray-900 px-6 py-3 text-base font-medium text-white hover:bg-gray-800 text-center"
            >
              View My Orders
            </Link>
            <Link
              to="/products"
              className="block text-sm text-green-600 hover:text-green-500"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}