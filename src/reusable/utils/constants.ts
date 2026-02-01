export const CURRENCY_SYMBOL = '₦';
export const API_BASE_URL = 'http://localhost:8000/api';
export const FREE_DELIVERY_THRESHOLD = 10000;
export const DELIVERY_FEE = 500;
export const TOKEN_KEY = 'jemi-token';
export const REFRESH_TOKEN_KEY = 'jemi-refresh-token';

export const NIGERIAN_STATES = [
    'Lagos', 'Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti', 'Kwara', 'Kogi',
    'Abuja', 'Rivers', 'Delta', 'Edo', 'Anambra', 'Imo', 'Enugu',
    'Kaduna', 'Kano', 'Plateau', 'Benue', 'Cross River'
];

export const ORDER_STATUSES = {
    processing: { label: 'Processing', color: 'yellow' },
    shipped: { label: 'Shipped', color: 'blue' },
    delivered: { label: 'Delivered', color: 'green' },
    cancelled: { label: 'Cancelled', color: 'red' },
};

export const PAYMENT_STATUSES = {
    pending: { label: 'Pending', color: 'yellow' },
    paid: { label: 'Paid', color: 'green' },
    failed: { label: 'Failed', color: 'red' },
};

export const CATEGORIES = [
    { id: 'fashion', name: 'Fashion', slug: 'fashion' },
    { id: 'electronics', name: 'Electronics', slug: 'electronics' },
    { id: 'food', name: 'Food & Drinks', slug: 'food' },
    { id: 'accessories', name: 'Accessories', slug: 'accessories' },
];