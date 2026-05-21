import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton placeholder while ProductGrid streams in. Match the grid
 * dimensions exactly so layout doesn't jump.
 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-border-soft">
          <Skeleton className="aspect-square w-full rounded-t-lg rounded-b-none" />
          <div className="p-3 sm:p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-9 w-full mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}