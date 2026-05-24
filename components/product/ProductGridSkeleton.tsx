export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="aspect-square w-full rounded-xl shimmer mb-3" />
          <div className="space-y-2">
            <div className="h-3 w-1/3 rounded shimmer" />
            <div className="h-4 w-3/4 rounded shimmer" />
            <div className="h-5 w-2/5 rounded shimmer mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}