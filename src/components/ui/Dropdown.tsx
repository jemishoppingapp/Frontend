import { useState, useRef, useEffect, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/reusable/utils/helpers';

interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  className?: string;
}

const positionStyles = {
  'bottom-left': 'top-full left-0 mt-1',
  'bottom-right': 'top-full right-0 mt-1',
  'top-left': 'bottom-full left-0 mb-1',
  'top-right': 'bottom-full right-0 mb-1',
};

export function Dropdown({
  trigger,
  items,
  position = 'bottom-left',
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled && item.onClick) {
      item.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className={cn('relative inline-block', className)}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 min-w-[160px] rounded-lg border border-gray-100 bg-white py-1 shadow-lg',
            'animate-fade-in',
            positionStyles[position]
          )}
        >
          {items.map((item) =>
            item.divider ? (
              <div
                key={item.id}
                className="my-1 border-t border-gray-100"
              />
            ) : (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={cn(
                  'flex w-full items-center gap-2 px-4 py-2 text-left text-sm',
                  'transition-colors',
                  item.disabled
                    ? 'cursor-not-allowed text-gray-300'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// Simple select dropdown
interface SelectDropdownProps {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SelectDropdown({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  className,
  disabled = false,
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2.5',
          'text-left transition-colors',
          'focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
          disabled && 'cursor-not-allowed bg-gray-50 opacity-60'
        )}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            'text-gray-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                'w-full px-4 py-2 text-left text-sm transition-colors',
                option.value === value
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
