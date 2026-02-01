import { clsx, type ClassValue } from 'clsx';
import { FREE_DELIVERY_THRESHOLD, DELIVERY_FEE } from './constants';

// Classname utility
export const cn = (...inputs: ClassValue[]): string => {
  return clsx(inputs);
};

// Calculate cart totals
export const calculateCartTotals = (items: { priceValue: number; quantity: number }[]) => {
  const subtotal = items.reduce((acc, item) => acc + item.priceValue * item.quantity, 0);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return {
    subtotal,
    deliveryFee,
    total,
    itemCount,
    freeDeliveryEligible: subtotal >= FREE_DELIVERY_THRESHOLD,
    amountToFreeDelivery: Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal),
  };
};

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Debounce function
export const debounce = <T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
};

// Local storage helpers
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
};

// URL utilities
export const buildQueryString = (params: Record<string, string | number | boolean | undefined>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};