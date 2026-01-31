import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/reusable/utils/helpers';

type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'warning' | 'info' | 'gray';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-indigo-100 text-indigo-700',
  secondary: 'bg-violet-100 text-violet-700',
  accent: 'bg-orange-100 text-orange-700',
  success: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
  warning: 'bg-yellow-100 text-yellow-700',
  info: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-700',
};

const dotColors: Record<BadgeVariant, string> = {
  primary: 'bg-indigo-500',
  secondary: 'bg-violet-500',
  accent: 'bg-orange-500',
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
  gray: 'bg-gray-500',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

export function Badge({
  variant = 'gray',
  size = 'md',
  children,
  dot = false,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}

// Discount Badge (specifically for product discounts)
interface DiscountBadgeProps {
  discount: number;
  className?: string;
}

export function DiscountBadge({ discount, className }: DiscountBadgeProps) {
  if (discount <= 0) return null;
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md bg-orange-500 px-2 py-1',
        'text-xs font-semibold text-white',
        className
      )}
    >
      -{discount}%
    </span>
  );
}

// Stock Badge
interface StockBadgeProps {
  stock: number;
  threshold?: number;
  className?: string;
}

export function StockBadge({ stock, threshold = 5, className }: StockBadgeProps) {
  if (stock === 0) {
    return (
      <Badge variant="error" size="sm" className={className}>
        Out of Stock
      </Badge>
    );
  }
  
  if (stock <= threshold) {
    return (
      <Badge variant="warning" size="sm" className={className}>
        Only {stock} left
      </Badge>
    );
  }
  
  return (
    <Badge variant="success" size="sm" className={className}>
      In Stock
    </Badge>
  );
}

export default Badge;
