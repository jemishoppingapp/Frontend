/**
 * MOCK DATA - DELETE WHEN FASTAPI IS READY
 */

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
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderItem {
  id: number;
  name: string;
  price: string;
  imageSrc: string;
  imageAlt: string;
  description: string;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  datePlaced: string;
  dateDelivered?: string;
  totalAmount: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
}

export interface Category {
  id: string;
  name: string;
  href: string;
  description: string;
  imageSrc: string;
  icon: string;
}

export const MOCK_PRODUCTS: Product[] = [
  // Fashion
  { 
    id: 1, 
    name: 'Basic Tee Premium Cotton', 
    href: '/products/1', 
    price: '₦12,500', 
    priceValue: 12500,
    originalPrice: '₦15,000',
    originalPriceValue: 15000,
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-01.jpg', 
    imageAlt: 'Basic Tee in black', 
    color: 'Black', 
    category: 'fashion', 
    inStock: true,
    rating: 4.7,
    reviewCount: 1613,
    features: ['100% Premium Cotton', 'Comfortable Fit'],
    seller: 'JEMI Store'
  },
  { 
    id: 2, 
    name: 'Basic Tee Classic White', 
    href: '/products/2', 
    price: '₦12,500', 
    priceValue: 12500,
    originalPrice: '₦15,000',
    originalPriceValue: 15000,
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-02.jpg', 
    imageAlt: 'Basic Tee in white', 
    color: 'White', 
    category: 'fashion', 
    inStock: true,
    rating: 4.8,
    reviewCount: 892,
    features: ['100% Premium Cotton', 'Easy Care Fabric'],
    seller: 'JEMI Store'
  },
  { 
    id: 3, 
    name: 'Polo Shirt Classic Fit', 
    href: '/products/3', 
    price: '₦18,000', 
    priceValue: 18000,
    originalPrice: '₦22,000',
    originalPriceValue: 22000,
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-03.jpg', 
    imageAlt: 'Polo shirt', 
    color: 'Gray', 
    category: 'fashion', 
    inStock: true,
    rating: 4.6,
    reviewCount: 445,
    features: ['Breathable Material', 'Classic Collar Design'],
    seller: 'JEMI Store'
  },
  // Electronics
  { 
    id: 4, 
    name: 'Wireless Earbuds Pro', 
    href: '/products/4', 
    price: '₦25,000', 
    priceValue: 25000,
    originalPrice: '₦30,000',
    originalPriceValue: 30000,
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-04.jpg', 
    imageAlt: 'Wireless earbuds', 
    color: 'White', 
    category: 'electronics', 
    inStock: true,
    rating: 4.8,
    reviewCount: 2341,
    features: ['Active Noise Cancellation', 'HD Sound Quality'],
    seller: 'JEMI Store'
  },
  { 
    id: 5, 
    name: 'Fast Phone Charger 25W', 
    href: '/products/5', 
    price: '₦8,500', 
    priceValue: 8500,
    originalPrice: '₦10,000',
    originalPriceValue: 10000,
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-02.jpg', 
    imageAlt: 'Phone charger', 
    color: 'Black', 
    category: 'electronics', 
    inStock: true,
    rating: 4.7,
    reviewCount: 1892,
    features: ['25W Fast Charging', 'Universal Compatibility'],
    seller: 'JEMI Store'
  },
  { 
    id: 6, 
    name: 'USB-C Braided Cable 2M', 
    href: '/products/6', 
    price: '₦3,500', 
    priceValue: 3500,
    originalPrice: '₦4,500',
    originalPriceValue: 4500,
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-03.jpg', 
    imageAlt: 'USB cable', 
    color: 'White', 
    category: 'electronics', 
    inStock: true,
    rating: 4.5,
    reviewCount: 3201,
    features: ['Durable Braided Design', '3A Fast Charging'],
    seller: 'JEMI Store'
  },
  // Food
  { 
    id: 7, 
    name: 'Premium Snack Pack', 
    href: '/products/7', 
    price: '₦2,500', 
    priceValue: 2500,
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-04-detail-product-shot-01.jpg', 
    imageAlt: 'Snack pack', 
    category: 'food', 
    inStock: true,
    rating: 4.9,
    reviewCount: 567,
    features: ['Assorted Flavors', 'Fresh & Tasty'],
    seller: 'JEMI Store'
  },
  { 
    id: 8, 
    name: 'Energy Drink Pack 6pcs', 
    href: '/products/8', 
    price: '₦4,000', 
    priceValue: 4000,
    originalPrice: '₦4,800',
    originalPriceValue: 4800,
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-01.jpg', 
    imageAlt: 'Energy drinks', 
    category: 'food', 
    inStock: true,
    rating: 4.6,
    reviewCount: 234,
    features: ['High Energy Boost', 'Refreshing Taste'],
    seller: 'JEMI Store'
  },
  // Accessories
  { 
    id: 9, 
    name: 'Zip Tote Basket Premium', 
    href: '/products/9', 
    price: '₦50,000', 
    priceValue: 50000,
    originalPrice: '₦58,000',
    originalPriceValue: 58000,
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-04-product-03.jpg', 
    imageAlt: 'Tote bag', 
    color: 'White', 
    category: 'accessories', 
    inStock: true,
    rating: 4.8,
    reviewCount: 189,
    features: ['Premium Quality', 'Large Capacity'],
    seller: 'JEMI Store'
  },
  { 
    id: 10, 
    name: 'Leather Wallet Genuine', 
    href: '/products/10', 
    price: '₦15,000', 
    priceValue: 15000,
    originalPrice: '₦18,000',
    originalPriceValue: 18000,
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-04-product-01.jpg', 
    imageAlt: 'Leather wallet', 
    color: 'Brown', 
    category: 'accessories', 
    inStock: true,
    rating: 4.7,
    reviewCount: 892,
    features: ['Genuine Leather', 'Multiple Card Slots'],
    seller: 'JEMI Store'
  },
  { 
    id: 11, 
    name: 'Backpack Urban Style', 
    href: '/products/11', 
    price: '₦35,000', 
    priceValue: 35000,
    originalPrice: '₦42,000',
    originalPriceValue: 42000,
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-04-product-02.jpg', 
    imageAlt: 'Backpack', 
    color: 'Black', 
    category: 'accessories', 
    inStock: true,
    rating: 4.9,
    reviewCount: 1234,
    features: ['Water Resistant', 'Laptop Compartment'],
    seller: 'JEMI Store'
  },
];

export const MOCK_ORDERS: Order[] = [
  { 
    id: '1', 
    orderNumber: 'JM48441546', 
    datePlaced: 'Jan 25, 2025', 
    dateDelivered: 'Jan 28, 2025', 
    totalAmount: '₦12,500', 
    status: 'delivered', 
    items: [{ id: 1, name: 'Basic Tee', price: '₦12,500', imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-01.jpg', imageAlt: 'Basic Tee', description: 'Comfortable cotton t-shirt.', quantity: 1 }] 
  },
];

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'fashion',
    name: 'Fashion',
    href: '/products?category=fashion',
    description: 'Clothes & Shoes',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-01.jpg',
    icon: '👕'
  },
  {
    id: 'electronics',
    name: 'Electronics',
    href: '/products?category=electronics',
    description: 'Gadgets & Tech',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-04.jpg',
    icon: '🎧'
  },
  {
    id: 'food',
    name: 'Food & Drinks',
    href: '/products?category=food',
    description: 'Snacks & Beverages',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-04-detail-product-shot-01.jpg',
    icon: '🍔'
  },
  {
    id: 'accessories',
    name: 'Accessories',
    href: '/products?category=accessories',
    description: 'Bags & Wallets',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-04-product-03.jpg',
    icon: '👜'
  },
];

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'all') return MOCK_PRODUCTS;
  return MOCK_PRODUCTS.filter(p => p.category === category);
};