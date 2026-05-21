import { Shirt, Headphones, UtensilsCrossed, ShoppingBag, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * CategoryIcon — single source of truth for category visuals.
 *
 * Why: emoji renders inconsistently across Android vendors (Samsung,
 * Google, MIUI all differ), and on cheap devices with old emoji fonts
 * some don't render at all. Lucide SVG icons are pixel-identical on
 * every device.
 *
 * If you add a new category, update CATEGORY_ICONS below AND seed it
 * via scripts/seed-categories.ts. Categories without a registered
 * icon fall back to a generic ShoppingBag.
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  fashion: Shirt,
  electronics: Headphones,
  food: UtensilsCrossed,
  accessories: ShoppingBag,
};

export function CategoryIcon({
  slug,
  className,
  'aria-hidden': ariaHidden = true,
}: {
  slug: string;
  className?: string;
  'aria-hidden'?: boolean;
}) {
  const Icon = CATEGORY_ICONS[slug] ?? ShoppingBag;
  return <Icon className={cn('h-5 w-5', className)} aria-hidden={ariaHidden} />;
}

export { CATEGORY_ICONS };