import { cn } from '@/reusable/utils/helpers';

type SpinnerSize = 'sm' | 'md' | 'lg';
type SpinnerColor = 'primary' | 'secondary' | 'white' | 'gray';

interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-3',
};

const colorStyles: Record<SpinnerColor, string> = {
  primary: 'border-indigo-500 border-t-transparent',
  secondary: 'border-violet-500 border-t-transparent',
  white: 'border-white border-t-transparent',
  gray: 'border-gray-400 border-t-transparent',
};

export function Spinner({
  size = 'md',
  color = 'primary',
  className,
}: SpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full',
        sizeStyles[size],
        colorStyles[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Full page loading spinner
interface PageSpinnerProps {
  text?: string;
}

export function PageSpinner({ text = 'Loading...' }: PageSpinnerProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}

// Inline loading spinner with text
interface InlineSpinnerProps {
  text?: string;
  size?: SpinnerSize;
}

export function InlineSpinner({ text, size = 'sm' }: InlineSpinnerProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <Spinner size={size} />
      {text && <span className="text-sm text-gray-500">{text}</span>}
    </span>
  );
}

export default Spinner;
