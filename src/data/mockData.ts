/**
 * MOCK DATA - DELETE WHEN FASTAPI IS READY
 */

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
}

export const MOCK_PRODUCTS: Product[] = [
  // Fashion
  { id: 1, name: 'Basic Tee', href: '/products/1', price: '₦12,500', priceValue: 12500, imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-01.jpg', imageAlt: 'Basic Tee in black', color: 'Black', category: 'fashion', inStock: true },
  { id: 2, name: 'Basic Tee', href: '/products/2', price: '₦12,500', priceValue: 12500, imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-02.jpg', imageAlt: 'Basic Tee in white', color: 'White', category: 'fashion', inStock: true },
  { id: 3, name: 'Polo Shirt', href: '/products/3', price: '₦18,000', priceValue: 18000, imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-03.jpg', imageAlt: 'Polo shirt', color: 'Gray', category: 'fashion', inStock: true },
  // Electronics
  { id: 4, name: 'Wireless Earbuds', href: '/products/4', price: '₦25,000', priceValue: 25000, imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-04.jpg', imageAlt: 'Wireless earbuds', color: 'White', category: 'electronics', inStock: true },
  { id: 5, name: 'Phone Charger', href: '/products/5', price: '₦8,500', priceValue: 8500, imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-02.jpg', imageAlt: 'Phone charger', color: 'Black', category: 'electronics', inStock: true },
  { id: 6, name: 'USB Cable', href: '/products/6', price: '₦3,500', priceValue: 3500, imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-03.jpg', imageAlt: 'USB cable', color: 'White', category: 'electronics', inStock: true },
  // Food
  { id: 7, name: 'Snack Pack', href: '/products/7', price: '₦2,500', priceValue: 2500, imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-04-detail-product-shot-01.jpg', imageAlt: 'Snack pack', color: '', category: 'food', inStock: true },
  { id: 8, name: 'Energy Drink Pack', href: '/products/8', price: '₦4,000', priceValue: 4000, imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-01.jpg', imageAlt: 'Energy drinks', color: '', category: 'food', inStock: true },
  // Accessories
  { id: 9, name: 'Zip Tote Basket', href: '/products/9', price: '₦50,000', priceValue: 50000, imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-04-product-03.jpg', imageAlt: 'Tote bag', color: 'White', category: 'accessories', inStock: true },
  { id: 10, name: 'Leather Wallet', href: '/products/10', price: '₦15,000', priceValue: 15000, imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-04-product-01.jpg', imageAlt: 'Leather wallet', color: 'Brown', category: 'accessories', inStock: true },
  { id: 11, name: 'Backpack', href: '/products/11', price: '₦35,000', priceValue: 35000, imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-04-product-02.jpg', imageAlt: 'Backpack', color: 'Black', category: 'accessories', inStock: true },
];

export const MOCK_ORDERS: Order[] = [
  { id: '1', orderNumber: 'JM48441546', datePlaced: 'Jan 25, 2025', dateDelivered: 'Jan 28, 2025', totalAmount: '₦12,500', status: 'delivered', items: [{ id: 1, name: 'Basic Tee', price: '₦12,500', imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-01.jpg', imageAlt: 'Basic Tee', description: 'Comfortable cotton t-shirt.', quantity: 1 }] },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: 'fashion', name: 'Fashion', href: '/products?category=fashion', description: 'Clothes, shoes & more', imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-01.jpg' },
  { id: 'electronics', name: 'Electronics', href: '/products?category=electronics', description: 'Gadgets & accessories', imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-04.jpg' },
  { id: 'food', name: 'Food & Drinks', href: '/products?category=food', description: 'Snacks, drinks & groceries', imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-04-detail-product-shot-01.jpg' },
  { id: 'accessories', name: 'Accessories', href: '/products?category=accessories', description: 'Bags, wallets & more', imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-04-product-03.jpg' },
];

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'all') return MOCK_PRODUCTS;
  return MOCK_PRODUCTS.filter(p => p.category === category);
};