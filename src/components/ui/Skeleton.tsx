import { cn } from '@/reusable/utils/helpers';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const variantStyles = {
    text: 'rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  return (
    <div
      className={cn(
        'bg-gray-200',
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      {/* Image */}
      <Skeleton className="mb-4 aspect-square w-full" variant="rectangular" />
      
      {/* Title */}
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="mb-3 h-4 w-1/2" />
      
      {/* Rating */}
      <Skeleton className="mb-3 h-3 w-24" />
      
      {/* Price */}
      <Skeleton className="mb-4 h-5 w-20" />
      
      {/* Button */}
      <Skeleton className="h-10 w-full" variant="rectangular" />
    </div>
  );
}

// Product Grid Skeleton
interface ProductGridSkeletonProps {
  count?: number;
}

export function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Order Card Skeleton
export function OrderCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="mb-2 h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-20" variant="rectangular" />
      </div>
      
      <div className="my-4 border-t border-gray-100" />
      
      <div className="flex gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-16" variant="rectangular" />
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-28" variant="rectangular" />
      </div>
    </div>
  );
}

// Text Line Skeleton
interface TextSkeletonProps {
  lines?: number;
  className?: string;
}

export function TextSkeleton({ lines = 3, className }: TextSkeletonProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

// Avatar Skeleton
interface AvatarSkeletonProps {
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarSkeleton({ size = 'md' }: AvatarSkeletonProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return <Skeleton className={sizeClasses[size]} variant="circular" />;
}

export default Skeleton;
