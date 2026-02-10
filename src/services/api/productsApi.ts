import apiClient, { ApiResponse } from './client';
import { ENDPOINTS } from './endpoints';
import type { Product, Category } from '@/reusable/types';

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const productsApi = {
  async getProducts(params: { page?: number; limit?: number; category?: string } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.category && params.category !== 'all') query.append('category', params.category);
    
    const response = await apiClient.get<ApiResponse<ProductListResponse>>(
      `${ENDPOINTS.PRODUCTS.BASE}?${query.toString()}`
    );
    return response.data.data;
  },

  async getProduct(id: string | number) {
    const response = await apiClient.get<ApiResponse<Product>>(ENDPOINTS.PRODUCTS.DETAIL(String(id)));
    return response.data.data;
  },

  async getFeatured(limit = 8) {
    const response = await apiClient.get<ApiResponse<Product[]>>(`${ENDPOINTS.PRODUCTS.FEATURED}?limit=${limit}`);
    return response.data.data;
  },

  async getByCategory(category: string, page = 1, limit = 20) {
    const response = await apiClient.get<ApiResponse<ProductListResponse>>(
      `${ENDPOINTS.PRODUCTS.BY_CATEGORY(category)}?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },
};

export const categoriesApi = {
  async getAll() {
    const response = await apiClient.get<ApiResponse<Category[]>>(ENDPOINTS.CATEGORIES.BASE);
    return response.data.data;
  },
};