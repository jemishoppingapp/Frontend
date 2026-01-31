import { type ReactNode } from 'react';
import { cn } from '@/reusable/utils/helpers';

interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  fullWidth?: boolean;
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  fullWidth = false,
  className,
}: TabsProps) {
  const baseTabStyles = 'flex items-center gap-2 font-medium transition-all duration-200';
  
  const variantStyles = {
    default: {
      container: 'flex gap-1 rounded-lg bg-gray-100 p-1',
      tab: cn(
        baseTabStyles,
        'rounded-md px-4 py-2 text-sm',
        'text-gray-600 hover:text-gray-900'
      ),
      active: 'bg-white text-gray-900 shadow-sm',
    },
    pills: {
      container: 'flex gap-2',
      tab: cn(
        baseTabStyles,
        'rounded-full px-4 py-2 text-sm',
        'text-gray-600 hover:bg-gray-100'
      ),
      active: 'bg-indigo-500 text-white hover:bg-indigo-600',
    },
    underline: {
      container: 'flex border-b border-gray-200',
      tab: cn(
        baseTabStyles,
        'border-b-2 border-transparent px-4 py-3 text-sm',
        'text-gray-600 hover:border-gray-300 hover:text-gray-900'
      ),
      active: 'border-indigo-500 text-indigo-600',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        styles.container,
        fullWidth && 'w-full',
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            styles.tab,
            activeTab === tab.id && styles.active,
            fullWidth && 'flex-1 justify-center'
          )}
        >
          {tab.icon}
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs',
                activeTab === tab.id
                  ? variant === 'pills'
                    ? 'bg-white/20'
                    : 'bg-indigo-100 text-indigo-600'
                  : 'bg-gray-200 text-gray-600'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// Tab Panel for content
interface TabPanelProps {
  children: ReactNode;
  tabId: string;
  activeTab: string;
  className?: string;
}

export function TabPanel({
  children,
  tabId,
  activeTab,
  className,
}: TabPanelProps) {
  if (tabId !== activeTab) return null;

  return (
    <div
      role="tabpanel"
      aria-labelledby={`tab-${tabId}`}
      className={cn('animate-fade-in', className)}
    >
      {children}
    </div>
  );
}

export default Tabs;
