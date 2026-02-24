export interface Product {
  id: number;
  name: string;
  href: string;
  price: string;
  priceValue: number;
  originalPrice?: string;
  originalPriceValue?: number;
  imageSrc: string;
  imageAlt: string;
  color?: string;
  category: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  features: string[];
  seller: string;
  description?: string;
  stockQuantity?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  href: string;
  description?: string;
  imageSrc?: string;
  icon?: string;
}
