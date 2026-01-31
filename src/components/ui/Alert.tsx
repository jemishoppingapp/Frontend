import { type ReactNode } from 'react';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/reusable/utils/helpers';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type?: AlertType;
  title?: string;
  children: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  icon?: ReactNode;
}

const typeStyles: Record<AlertType, { container: string; icon: string }> = {
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: 'text-green-500',
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: 'text-red-500',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: 'text-yellow-500',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: 'text-blue-500',
  },
};

const defaultIcons: Record<AlertType, ReactNode> = {
  success: <CheckCircle size={20} />,
  error: <AlertCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <Info size={20} />,
};

export function Alert({
  type = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className,
  icon,
}: AlertProps) {
  const styles = typeStyles[type];
  const iconElement = icon || defaultIcons[type];

  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg border p-4',
        styles.container,
        className
      )}
    >
      <div className="flex gap-3">
        {iconElement && (
          <div className={cn('flex-shrink-0', styles.icon)}>
            {iconElement}
          </div>
        )}
        
        <div className="flex-1">
          {title && (
            <h3 className="mb-1 font-semibold">{title}</h3>
          )}
          <div className="text-sm">{children}</div>
        </div>

        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={cn(
              'flex-shrink-0 rounded-lg p-1 transition-colors',
              'hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2',
              type === 'success' && 'focus:ring-green-500',
              type === 'error' && 'focus:ring-red-500',
              type === 'warning' && 'focus:ring-yellow-500',
              type === 'info' && 'focus:ring-blue-500'
            )}
            aria-label="Dismiss alert"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export default Alert;
