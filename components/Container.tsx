import { cn } from '@/lib/utils';
import type { ReactNode, ElementType } from 'react';

/**
 * Container — unified horizontal spacing primitive.
 *
 * Use this everywhere a content section needs to align with the rest of
 * the page. Three width presets:
 *   - narrow  (max-w-3xl)   prose, login forms, single-column flows
 *   - default (max-w-7xl)   the main grid width — pages, cards, lists
 *   - wide    (full width)  edge-to-edge hero sections; spacing still applies
 *
 * Edge padding is the SAME for every variant:
 *   px-4 sm:px-6 lg:px-8
 * This is what gives the site visual consistency across breakpoints.
 * If you find yourself bypassing Container to add custom padding, stop —
 * fix the Container variant or add a new one. (Tenderville lesson.)
 */
type ContainerProps = {
  children: ReactNode;
  className?: string;
  size?: 'narrow' | 'default' | 'wide';
  as?: ElementType;
};

const sizeMap: Record<NonNullable<ContainerProps['size']>, string> = {
  narrow: 'max-w-3xl',
  default: 'max-w-7xl',
  wide: 'max-w-none',
};

export function Container({
  children,
  className,
  size = 'default',
  as: Tag = 'div',
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        sizeMap[size],
        className
      )}
    >
      {children}
    </Tag>
  );
}