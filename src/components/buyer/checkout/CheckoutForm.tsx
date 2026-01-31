import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/reusable/utils/helpers';
import ShippingForm from './ShippingForm';
import PaymentMethod from './PaymentMethod';
import type { ShippingFormData } from '@/reusable/utils/validators';

type CheckoutStep = 'shipping' | 'payment';

interface CheckoutFormProps {
  onComplete: (data: {
    shipping: ShippingFormData;
    paymentMethod: 'paystack' | 'flutterwave';
  }) => void;
  isLoading?: boolean;
}

const steps = [
  { id: 'shipping', label: 'Shipping', number: 1 },
  { id: 'payment', label: 'Payment', number: 2 },
] as const;

export function CheckoutForm({ onComplete, isLoading = false }: CheckoutFormProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'flutterwave' | null>(null);

  const handleShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    setCurrentStep('payment');
  };

  const handlePaymentConfirm = () => {
    if (shippingData && paymentMethod) {
      onComplete({
        shipping: shippingData,
        paymentMethod,
      });
    }
  };

  const getStepStatus = (stepId: string) => {
    if (stepId === 'shipping') {
      return shippingData ? 'completed' : currentStep === 'shipping' ? 'current' : 'upcoming';
    }
    if (stepId === 'payment') {
      return currentStep === 'payment' ? 'current' : 'upcoming';
    }
    return 'upcoming';
  };

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <nav aria-label="Checkout progress">
        <ol className="flex items-center">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const isLast = index === steps.length - 1;

            return (
              <li
                key={step.id}
                className={cn('flex items-center', !isLast && 'flex-1')}
              >
                <div className="flex items-center">
                  {/* Step Circle */}
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                      status === 'completed' && 'bg-green-500 text-white',
                      status === 'current' && 'bg-indigo-500 text-white',
                      status === 'upcoming' && 'bg-gray-200 text-gray-500'
                    )}
                  >
                    {status === 'completed' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.number
                    )}
                  </div>

                  {/* Step Label */}
                  <span
                    className={cn(
                      'ml-2 text-sm font-medium',
                      status === 'completed' && 'text-green-600',
                      status === 'current' && 'text-indigo-600',
                      status === 'upcoming' && 'text-gray-500'
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-4',
                      status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        {currentStep === 'shipping' && (
          <ShippingForm
            defaultValues={shippingData || undefined}
            onSubmit={handleShippingSubmit}
          />
        )}

        {currentStep === 'payment' && (
          <>
            {/* Back Button */}
            <button
              type="button"
              onClick={() => setCurrentStep('shipping')}
              className="mb-6 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Back to Shipping
            </button>

            <PaymentMethod
              selectedMethod={paymentMethod}
              onSelectMethod={setPaymentMethod}
              onConfirm={handlePaymentConfirm}
              isLoading={isLoading}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default CheckoutForm;
