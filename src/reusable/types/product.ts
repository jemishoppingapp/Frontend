export interface Product {
  id: number;
  name: string;
  href: string;
  price: string;
  priceValue: number;
  imageSrc: string;
  imageAlt: string;
  color?: string;
  category: string;
  inStock: boolean;
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
}