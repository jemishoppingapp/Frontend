import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/reusable/utils/helpers';
import { CATEGORIES } from '@/reusable/utils/constants';

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  categoryCounts?: Record<string, number>;
  className?: string;
}

export function CategoryTabs({
  activeCategory,
  onCategoryChange,
  categoryCounts,
  className,
}: CategoryTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Check scroll position to show/hide arrows
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 200;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className={cn('relative', className)}>
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className={cn(
            'absolute left-0 top-1/2 z-10 -translate-y-1/2',
            'flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md',
            'text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500'
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Tabs Container */}
      <div
        ref={scrollContainerRef}
        className="hide-scrollbar flex gap-2 overflow-x-auto px-1 py-1"
      >
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category.id;
          const count = categoryCounts?.[category.id];

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                isActive
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <span>{category.name}</span>
              {count !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className={cn(
            'absolute right-0 top-1/2 z-10 -translate-y-1/2',
            'flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md',
            'text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500'
          )}
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}

export default CategoryTabs;
