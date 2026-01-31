import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/reusable/utils/helpers';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className,
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substring(7)}`;
    const hasError = !!error;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-400">{leftIcon}</span>
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'w-full rounded-lg border bg-white px-4 py-2.5',
              'text-gray-900 placeholder:text-gray-400',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              hasError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              disabled && 'cursor-not-allowed bg-gray-50 opacity-60',
              className
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-400">{rightIcon}</span>
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <p
            className={cn(
              'text-sm',
              hasError ? 'text-red-500' : 'text-gray-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
