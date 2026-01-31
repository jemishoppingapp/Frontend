import { useState } from 'react';
import { Heart, Star, Minus, Plus, ShoppingCart, Truck, Shield, RotateCcw } from 'lucide-react';
import { cn } from '@/reusable/utils/helpers';
import { formatCurrency, calculateDiscount } from '@/reusable/utils/formatters';
import { FREE_DELIVERY_THRESHOLD } from '@/reusable/utils/constants';
import { useCart } from '@/reusable/hooks/useCart';
import type { Product } from '@/reusable/types';
import Button from '@/components/ui/Button';
import { Badge, DiscountBadge, StockBadge } from '@/components/ui/Badge';

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discount = product.compareAtPrice
    ? calculateDiscount(product.price, product.compareAtPrice)
    : 0;

  const isOutOfStock = product.stock === 0;
  const maxQuantity = Math.min(product.stock, 10);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '',
      quantity,
      stock: product.stock,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
    });
    setQuantity(1);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Image Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50">
          {discount > 0 && (
            <DiscountBadge
              discount={discount}
              className="absolute left-4 top-4 z-10"
            />
          )}
          <img
            src={product.images[selectedImage] || '/placeholder-product.png'}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Thumbnail Gallery */}
        {product.images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  'h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                  selectedImage === index
                    ? 'border-indigo-500'
                    : 'border-transparent hover:border-gray-200'
                )}
              >
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        {/* Category & Stock */}
        <div className="flex items-center gap-3">
          <Badge variant="gray">{product.category}</Badge>
          <StockBadge stock={product.stock} />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
          {product.name}
        </h1>

        {/* Rating */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={18}
                className={cn(
                  i < Math.floor(product.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-200'
                )}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {product.rating.toFixed(1)} ({product.reviewCount} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-gray-900">
            {formatCurrency(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xl text-gray-400 line-through">
              {formatCurrency(product.compareAtPrice)}
            </span>
          )}
          {discount > 0 && (
            <span className="text-sm font-semibold text-green-600">
              Save {discount}%
            </span>
          )}
        </div>

        {/* Seller */}
        <p className="text-sm text-gray-600">
          Sold by <span className="font-medium text-indigo-600">{product.sellerName}</span>
        </p>

        {/* Description */}
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-900">Description</h3>
          <p className="text-sm leading-relaxed text-gray-600">
            {product.description}
          </p>
        </div>

        {/* Quantity & Add to Cart */}
        {!isOutOfStock && (
          <div className="flex items-center gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center rounded-lg border border-gray-200">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="flex h-10 w-10 items-center justify-center text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= maxQuantity}
                className="flex h-10 w-10 items-center justify-center text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              size="lg"
              className="flex-1"
              leftIcon={<ShoppingCart size={20} />}
            >
              Add to Cart
            </Button>

            {/* Wishlist */}
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all',
                isWishlisted
                  ? 'border-red-200 bg-red-50 text-red-500'
                  : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500'
              )}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={20} className={cn(isWishlisted && 'fill-current')} />
            </button>
          </div>
        )}

        {/* Out of Stock Message */}
        {isOutOfStock && (
          <div className="rounded-lg bg-gray-100 p-4 text-center">
            <p className="font-medium text-gray-900">Currently Out of Stock</p>
            <p className="mt-1 text-sm text-gray-600">
              This item is temporarily unavailable. Please check back later.
            </p>
          </div>
        )}

        {/* Features */}
        <div className="grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
              <Truck size={18} className="text-indigo-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Free Delivery</p>
              <p className="text-xs text-gray-500">
                Orders over {formatCurrency(FREE_DELIVERY_THRESHOLD)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
              <Shield size={18} className="text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Secure Payment</p>
              <p className="text-xs text-gray-500">100% secure checkout</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
              <RotateCcw size={18} className="text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Easy Returns</p>
              <p className="text-xs text-gray-500">7-day return policy</p>
            </div>
          </div>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-6">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="gray" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
