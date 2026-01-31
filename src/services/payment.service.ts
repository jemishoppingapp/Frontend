import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

interface PaymentInitializeData {
  orderId: string;
  email: string;
  amount: number;
  paymentMethod: 'paystack' | 'flutterwave';
  callbackUrl?: string;
}

interface PaymentInitializeResponse {
  success: boolean;
  data: {
    reference: string;
    authorizationUrl: string;
    accessCode?: string;
  };
}

interface PaymentVerifyResponse {
  success: boolean;
  data: {
    status: 'success' | 'failed' | 'pending';
    reference: string;
    amount: number;
    paidAt?: string;
  };
}

export const paymentService = {
  // Initialize payment
  async initializePayment(data: PaymentInitializeData): Promise<PaymentInitializeResponse> {
    const response = await apiClient.post<PaymentInitializeResponse>(
      ENDPOINTS.PAYMENT.INITIALIZE,
      data
    );
    return response.data;
  },

  // Verify payment
  async verifyPayment(reference: string): Promise<PaymentVerifyResponse> {
    const response = await apiClient.post<PaymentVerifyResponse>(
      ENDPOINTS.PAYMENT.VERIFY,
      { reference }
    );
    return response.data;
  },

  // Open Paystack popup (client-side)
  openPaystackPopup(config: {
    key: string;
    email: string;
    amount: number;
    ref: string;
    onSuccess: (reference: string) => void;
    onClose: () => void;
  }): void {
    // This would use the Paystack inline JS library
    // Implementation depends on Paystack's inline script being loaded
    const handler = (window as unknown as { PaystackPop?: { setup: (config: unknown) => { openIframe: () => void } } }).PaystackPop?.setup({
      key: config.key,
      email: config.email,
      amount: config.amount * 100, // Paystack expects kobo
      ref: config.ref,
      onClose: config.onClose,
      callback: (response: { reference: string }) => {
        config.onSuccess(response.reference);
      },
    });
    
    handler?.openIframe();
  },

  // Open Flutterwave popup (client-side)
  openFlutterwavePopup(config: {
    publicKey: string;
    txRef: string;
    amount: number;
    currency: string;
    email: string;
    name: string;
    phone: string;
    onSuccess: (response: unknown) => void;
    onClose: () => void;
  }): void {
    // This would use Flutterwave's inline JS library
    const FlutterwaveCheckout = (window as unknown as { FlutterwaveCheckout?: (config: unknown) => void }).FlutterwaveCheckout;
    FlutterwaveCheckout?.({
      public_key: config.publicKey,
      tx_ref: config.txRef,
      amount: config.amount,
      currency: config.currency,
      customer: {
        email: config.email,
        name: config.name,
        phone_number: config.phone,
      },
      customizations: {
        title: 'JEMI',
        description: 'Payment for your order',
        logo: '/logo.png',
      },
      callback: config.onSuccess,
      onclose: config.onClose,
    });
  },
};

export default paymentService;
