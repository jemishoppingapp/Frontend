import { useState } from 'react';
import { Check, CreditCard, Smartphone, Building2, Shield } from 'lucide-react';
import { cn } from '@/reusable/utils/helpers';
import Button from '@/components/ui/Button';

type PaymentOption = 'paystack' | 'flutterwave';

interface PaymentMethodProps {
  selectedMethod: PaymentOption | null;
  onSelectMethod: (method: PaymentOption) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const paymentOptions = [
  {
    id: 'paystack' as const,
    name: 'Paystack',
    description: 'Pay with card, bank transfer, or USSD',
    features: ['Debit/Credit Cards', 'Bank Transfer', 'USSD'],
    logo: '/paystack-logo.svg',
    color: 'bg-blue-500',
  },
  {
    id: 'flutterwave' as const,
    name: 'Flutterwave',
    description: 'Pay with card, transfer, or mobile money',
    features: ['Debit/Credit Cards', 'Bank Transfer', 'Mobile Money'],
    logo: '/flutterwave-logo.svg',
    color: 'bg-orange-500',
  },
];

export function PaymentMethod({
  selectedMethod,
  onSelectMethod,
  onConfirm,
  isLoading = false,
}: PaymentMethodProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Select Payment Method
      </h3>

      <div className="space-y-3">
        {paymentOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelectMethod(option.id)}
            className={cn(
              'w-full p-4 rounded-xl border-2 text-left transition-all duration-200',
              selectedMethod === option.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            )}
          >
            <div className="flex items-start gap-4">
              {/* Selection Indicator */}
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                  selectedMethod === option.id
                    ? 'border-indigo-500 bg-indigo-500'
                    : 'border-gray-300'
                )}
              >
                {selectedMethod === option.id && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900">{option.name}</h4>
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      option.color
                    )}
                  >
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{option.description}</p>

                {/* Payment Features */}
                <div className="flex flex-wrap gap-2">
                  {option.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                    >
                      {feature.includes('Card') && <CreditCard className="w-3 h-3" />}
                      {feature.includes('Transfer') && <Building2 className="w-3 h-3" />}
                      {feature.includes('USSD') && <Smartphone className="w-3 h-3" />}
                      {feature.includes('Mobile') && <Smartphone className="w-3 h-3" />}
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Security Badge */}
      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-sm text-green-700">
        <Shield className="w-4 h-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      {/* Confirm Button */}
      <Button
        onClick={onConfirm}
        fullWidth
        disabled={!selectedMethod}
        isLoading={isLoading}
        className="h-12"
      >
        {isLoading ? 'Processing...' : 'Pay Now'}
      </Button>
    </div>
  );
}

export default PaymentMethod;
