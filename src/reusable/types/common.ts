export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  stock: number;
  seller: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  addedAt: string;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface SelectOption {
  value: string;
  label: string;
}

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}