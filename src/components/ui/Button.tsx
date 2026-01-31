import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/reusable/utils/helpers';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-500 text-white hover:bg-indigo-600 active:bg-indigo-700 focus-visible:ring-indigo-500',
  secondary:
    'bg-violet-500 text-white hover:bg-violet-600 active:bg-violet-700 focus-visible:ring-violet-500',
  accent:
    'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 focus-visible:ring-orange-500',
  outline:
    'border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-gray-400',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-gray-400',
  danger:
    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus-visible:ring-red-500',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-base gap-2',
  lg: 'h-12 px-6 text-lg gap-2.5',
};

const iconSizes: Record<ButtonSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-lg font-semibold',
          'transition-all duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          // Variant styles
          variantStyles[variant],
          // Size styles
          sizeStyles[size],
          // Width
          fullWidth && 'w-full',
          // Disabled state
          isDisabled && 'cursor-not-allowed opacity-50',
          // Custom className
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <Loader2
            className="animate-spin"
            size={iconSizes[size]}
          />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
