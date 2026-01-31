import { useState } from 'react';
import { X, SlidersHorizontal, Star } from 'lucide-react';
import { cn } from '@/reusable/utils/helpers';
import { formatCurrency } from '@/reusable/utils/formatters';
import type { ProductFilters } from '@/reusable/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface ProductFilterProps {
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
  onClear: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export function ProductFilter({
  filters,
  onFilterChange,
  onClear,
  isOpen = true,
  onClose,
  isMobile = false,
}: ProductFilterProps) {
  const [localMinPrice, setLocalMinPrice] = useState(
    filters.minPrice?.toString() || ''
  );
  const [localMaxPrice, setLocalMaxPrice] = useState(
    filters.maxPrice?.toString() || ''
  );

  const handlePriceChange = () => {
    onFilterChange({
      ...filters,
      minPrice: localMinPrice ? Number(localMinPrice) : undefined,
      maxPrice: localMaxPrice ? Number(localMaxPrice) : undefined,
    });
  };

  const handleRatingChange = (rating: number) => {
    onFilterChange({
      ...filters,
      rating: filters.rating === rating ? undefined : rating,
    });
  };

  const handleStockChange = () => {
    onFilterChange({
      ...filters,
      inStock: !filters.inStock,
    });
  };

  const hasActiveFilters =
    filters.minPrice ||
    filters.maxPrice ||
    filters.rating ||
    filters.inStock;

  const filterContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <SlidersHorizontal size={20} />
          Filters
        </h3>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Price Range */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">Price Range</h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={localMinPrice}
            onChange={(e) => setLocalMinPrice(e.target.value)}
            onBlur={handlePriceChange}
            className="text-sm"
          />
          <span className="text-gray-400">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={localMaxPrice}
            onChange={(e) => setLocalMaxPrice(e.target.value)}
            onBlur={handlePriceChange}
            className="text-sm"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            { label: 'Under ₦5k', min: 0, max: 5000 },
            { label: '₦5k - ₦20k', min: 5000, max: 20000 },
            { label: '₦20k - ₦50k', min: 20000, max: 50000 },
            { label: 'Over ₦50k', min: 50000, max: undefined },
          ].map((range) => (
            <button
              key={range.label}
              onClick={() => {
                setLocalMinPrice(range.min.toString());
                setLocalMaxPrice(range.max?.toString() || '');
                onFilterChange({
                  ...filters,
                  minPrice: range.min,
                  maxPrice: range.max,
                });
              }}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filters.minPrice === range.min && filters.maxPrice === range.max
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label
              key={rating}
              className="flex cursor-pointer items-center gap-3"
            >
              <input
                type="checkbox"
                checked={filters.rating === rating}
                onChange={() => handleRatingChange(rating)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
              />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={cn(
                      i < rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-200'
                    )}
                  />
                ))}
                <span className="ml-1 text-sm text-gray-600">& Up</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">Availability</h4>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={filters.inStock || false}
            onChange={handleStockChange}
            className="h-4 w-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-600">In Stock Only</span>
        </label>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={() => {
            setLocalMinPrice('');
            setLocalMaxPrice('');
            onClear();
          }}
        >
          Clear All Filters
        </Button>
      )}

      {/* Mobile Apply Button */}
      {isMobile && onClose && (
        <Button variant="primary" fullWidth onClick={onClose}>
          Apply Filters
        </Button>
      )}
    </div>
  );

  // Mobile: Render as modal/sidebar
  if (isMobile) {
    if (!isOpen) return null;

    return (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
        />
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] overflow-y-auto bg-white p-6 shadow-xl animate-slide-in-right">
          {filterContent}
        </div>
      </>
    );
  }

  // Desktop: Render inline
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6">
      {filterContent}
    </div>
  );
}

export default ProductFilter;
