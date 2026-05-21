'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ProductQuantitySelector } from './ProductQuantitySelector';
import { useCartStore } from '@/store/cart';

type DetailProduct = {
  _id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  seller: string;
  inStock: boolean;
  stockQuantity: number;
};

/**
 * Quantity selector + add-to-cart on the product detail page.
 *
 * Kept as a small client island so the rest of the detail page can stay
 * server-rendered (better SEO, smaller bundle).
 */
export function ProductDetailActions({ product }: { product: DetailProduct }) {
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  // Max is the lesser of: declared stock (if > 0) or 99
  const max = product.stockQuantity > 0 ? Math.min(product.stockQuantity, 99) : 99;

  function handleAdd() {
    if (!product.inStock) {
      toast.error('This item is out of stock');
      return;
    }
    addItem(
      {
        productId: product._id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        seller: product.seller,
      },
      qty
    );
    toast.success(
      qty === 1
        ? `${product.name} added to cart`
        : `${qty}× ${product.name} added to cart`
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <ProductQuantitySelector
        value={qty}
        onChange={setQty}
        min={1}
        max={max}
        disabled={!product.inStock}
      />
      <Button
        variant="default"
        size="tap"
        className="w-full sm:w-auto sm:flex-1"
        onClick={handleAdd}
        disabled={!product.inStock}
      >
        <ShoppingBag className="h-4 w-4" />
        Add to cart
      </Button>
    </div>
  );
}