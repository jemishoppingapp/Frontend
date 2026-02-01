import { CURRENCY_SYMBOL } from './constants';

export const formatCurrency = (amount: number): string => {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-NG')}`;
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  return phone;
};

export const calculateDiscount = (price: number, compareAt: number): number => {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
};

export const generateStarRating = (rating: number): string[] => {
  const stars: string[] = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) stars.push('full');
    else if (i - 0.5 <= rating) stars.push('half');
    else stars.push('empty');
  }
  return stars;
};