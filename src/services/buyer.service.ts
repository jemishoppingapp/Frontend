import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';
import { buildQueryString } from '@/reusable/utils/helpers';
import type {
  Product,
  ProductsResponse,
  ProductFilters,
  Category,
  Review,
  Order,
  OrdersResponse,
  CreateOrderData,
  OrderTimeline,
  CartItem,
  WishlistItem,
  Address,
} from '@/reusable/types';

// Products
export const productService = {
  // Get all products with filters
  async getProducts(
    filters?: ProductFilters,
    page = 1,
    limit = 20,
    sort?: string
  ): Promise<ProductsResponse> {
    const queryParams = buildQueryString({
      ...filters,
      page,
      limit,
      sort,
    });
    const response = await apiClient.get<ProductsResponse>(
      `${ENDPOINTS.PRODUCTS.BASE}${queryParams}`
    );
    return response.data;
  },

  // Get single product
  async getProduct(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(ENDPOINTS.PRODUCTS.DETAIL(id));
    return response.data;
  },

  // Get featured products
  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(
      `${ENDPOINTS.PRODUCTS.FEATURED}?limit=${limit}`
    );
    return response.data;
  },

  // Get trending products
  async getTrendingProducts(limit = 8): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(
      `${ENDPOINTS.PRODUCTS.TRENDING}?limit=${limit}`
    );
    return response.data;
  },

  // Search products
  async searchProducts(query: string, page = 1, limit = 20): Promise<ProductsResponse> {
    const response = await apiClient.get<ProductsResponse>(
      `${ENDPOINTS.PRODUCTS.SEARCH}?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Get products by category
  async getProductsByCategory(
    category: string,
    page = 1,
    limit = 20
  ): Promise<ProductsResponse> {
    const response = await apiClient.get<ProductsResponse>(
      `${ENDPOINTS.PRODUCTS.BY_CATEGORY(category)}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Get product reviews
  async getProductReviews(productId: string): Promise<Review[]> {
    const response = await apiClient.get<Review[]>(
      ENDPOINTS.PRODUCTS.REVIEWS(productId)
    );
    return response.data;
  },

  // Add product review
  async addProductReview(
    productId: string,
    data: { rating: number; comment: string }
  ): Promise<Review> {
    const response = await apiClient.post<Review>(
      ENDPOINTS.PRODUCTS.REVIEWS(productId),
      data
    );
    return response.data;
  },
};

// Categories
export const categoryService = {
  // Get all categories
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>(ENDPOINTS.CATEGORIES.BASE);
    return response.data;
  },

  // Get single category
  async getCategory(id: string): Promise<Category> {
    const response = await apiClient.get<Category>(ENDPOINTS.CATEGORIES.DETAIL(id));
    return response.data;
  },
};

// Cart (server-synced)
export const cartService = {
  // Get cart
  async getCart(): Promise<CartItem[]> {
    const response = await apiClient.get<CartItem[]>(ENDPOINTS.CART.BASE);
    return response.data;
  },

  // Add item to cart
  async addToCart(productId: string, quantity: number): Promise<CartItem[]> {
    const response = await apiClient.post<CartItem[]>(ENDPOINTS.CART.ITEMS, {
      productId,
      quantity,
    });
    return response.data;
  },

  // Update cart item quantity
  async updateCartItem(itemId: string, quantity: number): Promise<CartItem[]> {
    const response = await apiClient.put<CartItem[]>(ENDPOINTS.CART.ITEM(itemId), {
      quantity,
    });
    return response.data;
  },

  // Remove item from cart
  async removeFromCart(itemId: string): Promise<CartItem[]> {
    const response = await apiClient.delete<CartItem[]>(ENDPOINTS.CART.ITEM(itemId));
    return response.data;
  },

  // Clear cart
  async clearCart(): Promise<void> {
    await apiClient.delete(ENDPOINTS.CART.CLEAR);
  },
};

// Orders
export const orderService = {
  // Get all orders
  async getOrders(
    status?: string,
    page = 1,
    limit = 10
  ): Promise<OrdersResponse> {
    const queryParams = buildQueryString({ status, page, limit });
    const response = await apiClient.get<OrdersResponse>(
      `${ENDPOINTS.ORDERS.BASE}${queryParams}`
    );
    return response.data;
  },

  // Get single order
  async getOrder(id: string): Promise<Order> {
    const response = await apiClient.get<Order>(ENDPOINTS.ORDERS.DETAIL(id));
    return response.data;
  },

  // Create order
  async createOrder(data: CreateOrderData): Promise<Order> {
    const response = await apiClient.post<Order>(ENDPOINTS.ORDERS.BASE, data);
    return response.data;
  },

  // Cancel order
  async cancelOrder(id: string): Promise<Order> {
    const response = await apiClient.post<Order>(ENDPOINTS.ORDERS.CANCEL(id));
    return response.data;
  },

  // Track order
  async trackOrder(id: string): Promise<OrderTimeline[]> {
    const response = await apiClient.get<OrderTimeline[]>(ENDPOINTS.ORDERS.TRACK(id));
    return response.data;
  },
};

// Wishlist
export const wishlistService = {
  // Get wishlist
  async getWishlist(): Promise<WishlistItem[]> {
    const response = await apiClient.get<WishlistItem[]>(ENDPOINTS.WISHLIST.BASE);
    return response.data;
  },

  // Add to wishlist
  async addToWishlist(productId: string): Promise<WishlistItem> {
    const response = await apiClient.post<WishlistItem>(ENDPOINTS.WISHLIST.BASE, {
      productId,
    });
    return response.data;
  },

  // Remove from wishlist
  async removeFromWishlist(itemId: string): Promise<void> {
    await apiClient.delete(ENDPOINTS.WISHLIST.ITEM(itemId));
  },
};

// Addresses
export const addressService = {
  // Get all addresses
  async getAddresses(): Promise<Address[]> {
    const response = await apiClient.get<Address[]>(ENDPOINTS.USER.ADDRESSES);
    return response.data;
  },

  // Add address
  async addAddress(data: Omit<Address, 'id' | 'userId'>): Promise<Address> {
    const response = await apiClient.post<Address>(ENDPOINTS.USER.ADDRESSES, data);
    return response.data;
  },

  // Update address
  async updateAddress(
    id: string,
    data: Partial<Omit<Address, 'id' | 'userId'>>
  ): Promise<Address> {
    const response = await apiClient.put<Address>(ENDPOINTS.USER.ADDRESS(id), data);
    return response.data;
  },

  // Delete address
  async deleteAddress(id: string): Promise<void> {
    await apiClient.delete(ENDPOINTS.USER.ADDRESS(id));
  },

  // Set default address
  async setDefaultAddress(id: string): Promise<Address> {
    const response = await apiClient.put<Address>(ENDPOINTS.USER.ADDRESS(id), {
      isDefault: true,
    });
    return response.data;
  },
};

export default {
  productService,
  categoryService,
  cartService,
  orderService,
  wishlistService,
  addressService,
};
