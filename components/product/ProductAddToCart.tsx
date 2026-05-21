'use client';

import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import type { ProductCardData } from './ProductCard';

/**
 * The smallest possible client island: a button that calls addItem.
 * Kept tiny so the ProductCard server-renders most of itself.
 *
 * `compact` = card-sized button; `false` = full-width primary CTA for
 * the product detail page.
 */
export function ProductAddToCart({
  product,
  compact = false,
}: {
  product: ProductCardData;
  compact?: boolean;
}) {
  const addItem = useCartStore((s) => s.addItem);

  function handleClick() {
    if (!product.inStock) {
      toast.error("This item is out of stock");
      return;
    }
    addItem({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      seller: product.seller,
    });
    toast.success(`${product.name} added to cart`);
  }

  if (compact) {
    return (
      <Button
        variant="dark"
        size="sm"
        onClick={handleClick}
        disabled={!product.inStock}
        className="w-full tap"
      >
        <ShoppingBag className="h-3.5 w-3.5" />
        Add to cart
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      size="tap"
      onClick={handleClick}
      disabled={!product.inStock}
      className="w-full"
    >
      <ShoppingBag className="h-4 w-4" />
      Add to cart
    </Button>
  );
}