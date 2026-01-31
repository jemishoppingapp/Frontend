export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: Category;
  seller: {
    id: string;
    name: string;
    rating: number;
  };
  stock: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isTrending: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  productCount?: number;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  search?: string;
}

export interface ProductSort {
  field: 'price' | 'rating' | 'createdAt' | 'name';
  order: 'asc' | 'desc';
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}