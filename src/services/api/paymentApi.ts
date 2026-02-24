import apiClient, { ApiResponse, getErrorMessage } from './client';
import { ENDPOINTS } from './endpoints';

interface PaymentInitializeResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface PaymentVerifyResponse {
  order_number: string;
  pickup_code: string;
  pickup_location: string;
  total: string;
  status: string;
}

export const paymentApi = {
  /**
   * Sync local cart to backend in one atomic request.
   * Replaces entire backend cart contents.
   */
  async syncCartToBackend(items: { productId: number; quantity: number }[]): Promise<void> {
    await apiClient.post(ENDPOINTS.CART.SYNC, {
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    });
  },

  /**
   * Initialize Paystack payment.
   * Backend creates order from cart, calls Paystack, returns payment URL.
   */
  async initializePayment(data: {
    pickup_location: string;
    customer_note?: string;
  }): Promise<PaymentInitializeResponse> {
    const response = await apiClient.post<ApiResponse<PaymentInitializeResponse>>(
      ENDPOINTS.PAYMENT.INITIALIZE,
      {
        pickup_location: data.pickup_location,
        payment_method: 'paystack',
        customer_note: data.customer_note || undefined,
      }
    );
    return response.data.data;
  },

  /**
   * Verify payment after Paystack redirects back.
   */
  async verifyPayment(reference: string): Promise<PaymentVerifyResponse> {
    const response = await apiClient.post<ApiResponse<PaymentVerifyResponse>>(
      ENDPOINTS.PAYMENT.VERIFY,
      { reference }
    );
    return response.data.data;
  },
};

export default paymentApi;