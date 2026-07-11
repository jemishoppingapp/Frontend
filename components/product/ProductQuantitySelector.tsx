'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Quantity selector with - / + buttons. Numeric input is read-only on
 * mobile (forced taps on the buttons — easier than a tiny number input)
 * but editable on desktop.
 */
export function ProductQuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  function clamp(n: number) {
    return Math.max(min, Math.min(max, n));
  }

  return (
    <div className={cn('inline-flex items-center border border-border rounded-md', disabled && 'opacity-50')}>
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={disabled || value <= min}
        className="tap inline-flex items-center justify-center h-11 w-11 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!Number.isNaN(n)) onChange(clamp(n));
        }}
        disabled={disabled}
        min={min}
        max={max}
        className="w-14 h-11 text-center border-x border-border text-base font-semibold text-fg focus:outline-none focus:bg-surface-1 disabled:cursor-not-allowed"
        aria-label="Quantity"
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={disabled || value >= max}
        className="tap inline-flex items-center justify-center h-11 w-11 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}