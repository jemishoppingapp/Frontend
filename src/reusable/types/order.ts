import type { Product } from './product';
import type { Address } from './user';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: Address;
  timeline: OrderTimeline[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface CreateOrderData {
  items: { productId: string; quantity: number }[];
  shippingAddressId: string;
  paymentMethod: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}