export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Products
  PRODUCTS: {
    BASE: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    FEATURED: '/products/featured',
    TRENDING: '/products/trending',
    BY_CATEGORY: (category: string) => `/products/category/${category}`,
    SEARCH: '/products/search',
    REVIEWS: (id: string) => `/products/${id}/reviews`,
  },

  // Categories
  CATEGORIES: {
    BASE: '/categories',
    DETAIL: (id: string) => `/categories/${id}`,
  },

  // Cart
  CART: {
    BASE: '/cart',
    ITEMS: '/cart/items',
    ITEM: (id: string) => `/cart/items/${id}`,
    CLEAR: '/cart/clear',
  },

  // Orders
  ORDERS: {
    BASE: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    TRACK: (id: string) => `/orders/${id}/track`,
  },

  // Payment
  PAYMENT: {
    INITIALIZE: '/payment/initialize',
    VERIFY: '/payment/verify',
    WEBHOOK: '/payment/webhook',
  },

  // User
  USER: {
    PROFILE: '/user/profile',
    ADDRESSES: '/user/addresses',
    ADDRESS: (id: string) => `/user/addresses/${id}`,
  },

  // Wishlist
  WISHLIST: {
    BASE: '/wishlist',
    ITEM: (id: string) => `/wishlist/items/${id}`,
  },
} as const;
