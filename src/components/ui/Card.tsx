import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/reusable/utils/helpers';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      padding = 'md',
      hover = false,
      clickable = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border border-gray-100 bg-white',
          paddingStyles[padding],
          hover && 'transition-shadow duration-200 hover:shadow-md',
          clickable && 'cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn('border-b border-gray-100 px-4 py-3', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Card Body
interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardBody({ children, className, ...props }: CardBodyProps) {
  return (
    <div className={cn('p-4', className)} {...props}>
      {children}
    </div>
  );
}

// Card Footer
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn('border-t border-gray-100 px-4 py-3', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
