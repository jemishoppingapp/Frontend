import type { Product } from './product';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'in_transit' | 'ready_for_pickup' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
  seller: string;
}

export interface SubOrder {
  id: string;
  subOrderNumber: string;
  sellerName: string;
  subtotal: number;
  status: OrderStatus;
  pickupCode: string;
  items: OrderItem[];
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  subOrders: SubOrder[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  deliveryZone: string;
  deliveryDescription?: string;
  customerNote?: string;
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
  delivery_zone: string;
  delivery_description?: string;
  payment_method: string;
  customer_note?: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const DELIVERY_ZONES = [
  {
    id: 'lasu-iba-gate',
    name: 'LASU Iba Gate',
    description: 'LASU Iba entrance gate area',
  },
  {
    id: 'iyana-iba-gate',
    name: 'Iyana Iba Gate',
    description: 'Iyana Iba entrance gate area',
  },
];

// Keep backward compat during migration
export const PICKUP_LOCATIONS = DELIVERY_ZONES;