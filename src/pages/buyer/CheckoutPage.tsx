import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/reusable/utils/formatters';
import { DELIVERY_ZONES } from '@/reusable/types/order';
import { paymentApi } from '@/services/api/paymentApi';
import { getErrorMessage } from '@/services/api/client';
import { MapPinIcon, ShoppingBagIcon, UserIcon, CreditCardIcon } from '@heroicons/react/24/outline';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [deliveryZone, setDeliveryZone] = useState(DELIVERY_ZONES[0].id);
  const [deliveryDescription, setDeliveryDescription] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState('');

  // Guards
  if (!isAuthenticated) {
    navigate('/login', { state: { from: '/checkout' } });
    return null;
  }
  if (!user?.profile_completed) {
    navigate('/profile/complete', { state: { from: '/checkout' } });
    return null;
  }
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h2>
        <Link to="/products" className="mt-4 inline-block rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.priceValue * item.quantity, 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  // Group items by seller for display
  const itemsBySeller: Record<string, typeof items> = {};
  items.forEach((item) => {
    const seller = item.seller || 'JEMI Store';
    if (!itemsBySeller[seller]) itemsBySeller[seller] = [];
    itemsBySeller[seller].push(item);
  });

  const selectedZone = DELIVERY_ZONES.find(z => z.id === deliveryZone);

  const handlePayment = async () => {
    if (!deliveryDescription.trim()) {
      setError('Please describe where to deliver (e.g. "Beside Faculty of Science cafeteria")');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Step 1: Sync local cart → backend cart
      setProcessingStep('Syncing your cart...');
      await paymentApi.syncCartToBackend(
        items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        }))
      );

      // Step 2: Initialize payment (backend → Paystack)
      setProcessingStep('Connecting to Paystack...');
      const locationString = `${selectedZone?.name} — ${deliveryDescription.trim()}`;
      const result = await paymentApi.initializePayment({
        pickup_location: locationString,
        customer_note: customerNote || undefined,
      });

      // Step 3: Clear local cart
      clearCart();

      // Step 4: Redirect to Paystack
      window.location.href = result.authorization_url;
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setError(message);
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Left column - Details */}
          <div className="lg:col-span-7 space-y-6">

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <UserIcon className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-medium text-gray-900">Contact Information</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{user?.nickname || user?.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{user?.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Alt. Phone</p>
                  <p className="font-medium text-gray-900">{user?.alt_phone || '—'}</p>
                </div>
              </div>
            </div>

            {/* Delivery Zone */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPinIcon className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-medium text-gray-900">Delivery Location</h2>
              </div>

              {/* Zone Selection */}
              <p className="text-sm text-gray-500 mb-3">Select your delivery zone</p>
              <div className="space-y-3 mb-5">
                {DELIVERY_ZONES.map((zone) => (
                  <label
                    key={zone.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      deliveryZone === zone.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryZone"
                      value={zone.id}
                      checked={deliveryZone === zone.id}
                      onChange={(e) => setDeliveryZone(e.target.value)}
                      className="h-4 w-4 accent-green-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{zone.name}</p>
                      <p className="text-sm text-gray-500">{zone.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Delivery Description */}
              <p className="text-sm text-gray-500 mb-2">Describe where exactly on campus *</p>
              <input
                type="text"
                value={deliveryDescription}
                onChange={(e) => setDeliveryDescription(e.target.value)}
                placeholder="e.g. Beside Faculty of Science cafeteria, Under the mango tree near Library"
                maxLength={200}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 shadow-sm text-sm placeholder:text-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Help the dispatcher find you easily</p>
            </div>

            {/* Customer Note */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Note (Optional)</h2>
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Any special instructions? e.g. 'Please call before delivering'"
                rows={3}
                maxLength={500}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm text-sm placeholder:text-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Right column - Order Summary */}
          <div className="lg:col-span-5 mt-6 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

              {/* Items grouped by seller */}
              <div className="space-y-4 mb-6">
                {Object.entries(itemsBySeller).map(([seller, sellerItems]) => (
                  <div key={seller}>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">From {seller}</p>
                    {sellerItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 py-2">
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img src={item.imageSrc} alt={item.imageAlt} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.priceValue * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Dispatch Fee</span>
                  <span className="text-green-600 font-medium">{deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Delivery info */}
              {selectedZone && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="font-medium text-gray-900">📍 Deliver to: {selectedZone.name}</p>
                  {deliveryDescription && (
                    <p className="text-gray-500 text-xs mt-1">{deliveryDescription}</p>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-base font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                    {processingStep || 'Processing...'}
                  </>
                ) : (
                  <>
                    <CreditCardIcon className="h-5 w-5" />
                    Pay {formatCurrency(total)}
                  </>
                )}
              </button>

              <p className="mt-3 text-xs text-gray-400 text-center">
                Secured by Paystack. Supports cards, bank transfer, USSD &amp; OPay.
              </p>

              <Link to="/cart" className="mt-4 block text-center text-sm text-green-600 hover:text-green-500">
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}