import { CURRENCY_SYMBOL } from './constants';

export const formatCurrency = (amount: number): string => {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-NG')}`;
};
