import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Minus, Plus, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import { useCart } from '@/reusable/hooks/useCart';
import { formatCurrency, calculateDiscount, generateStarRating } from '@/reusable/utils/formatters';
import { cn } from '@/reusable/utils/helpers';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProductGrid from '@/components/buyer/product/ProductGrid';
import Skeleton from '@/components/ui/Skeleton';
import { toast } from 'sonner';
import type { Product } from '@/reusable/types';

// Mock product data
const mockProduct: Product = {
  id: '1',
  name: 'Wireless Bluetooth Earbuds Pro - Premium Quality Sound',
  description: `Experience crystal-clear audio with our premium Wireless Bluetooth Earbuds Pro. 
  
Features:
• Active Noise Cancellation for immersive listening
• 30-hour total battery life with charging case
• IPX5 water resistance for workouts
• Touch controls for easy operation
• Ergonomic design for all-day comfort
• Fast charging - 10 minutes gives 2 hours of playback

Perfect for music lovers, commuters, and fitness enthusiasts. Compatible with all Bluetooth-enabled devices.`,
  price: 15000,
  compareAtPrice: 20000,
  images: [
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
    'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600',
    'https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=600',
    'https://images.unsplash.com/photo-1631867675167-90a456a90863?w=600',
  ],
  category: 'Electronics',
  categoryId: 'electronics',
  stock: 50,
  sellerId: 'seller1',
  sellerName: 'TechHub NG',
  rating: 4.5,
  reviewCount: 128,
  isActive: true,
  isFeatured: true,
  tags: ['wireless', 'bluetooth', 'earbuds', 'audio'],
  createdAt: new Date().toISOString(),
};

const relatedProducts: Product[] = [
  {
    id: '2',
    name: 'Wireless Charging Pad',
    description: 'Fast wireless charging for all devices',
    price: 8000,
    images: ['https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=400'],
    category: 'Electronics',
    categoryId: 'electronics',
    stock: 100,
    sellerId: 'seller1',
    sellerName: 'TechHub NG',
    rating: 4.3,
    reviewCount: 67,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Portable Bluetooth Speaker',
    description: 'Powerful sound on the go',
    price: 12000,
    compareAtPrice: 15000,
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400'],
    category: 'Electronics',
    categoryId: 'electronics',
    stock: 45,
    sellerId: 'seller1',
    sellerName: 'TechHub NG',
    rating: 4.6,
    reviewCount: 89,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Phone Stand Holder',
    description: 'Adjustable desk phone stand',
    price: 3500,
    images: ['https://images.unsplash.com/photo-1586105449897-20b5efeb3233?w=400'],
    category: 'Electronics',
    categoryId: 'electronics',
    stock: 200,
    sellerId: 'seller1',
    sellerName: 'TechHub NG',
    rating: 4.4,
    reviewCount: 156,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'USB-C Cable 3-Pack',
    description: 'Durable fast charging cables',
    price: 2500,
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
    category: 'Electronics',
    categoryId: 'electronics',
    stock: 300,
    sellerId: 'seller1',
    sellerName: 'TechHub NG',
    rating: 4.7,
    reviewCount: 234,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem, getItemByProductId } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const cartItem = product ? getItemByProductId(product.id) : undefined;
  const currentCartQuantity = cartItem?.quantity || 0;

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      // In production, fetch from API using id
      setProduct(mockProduct);
      setIsLoading(false);
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    if (currentCartQuantity + quantity > product.stock) {
      toast.error('Not enough stock available');
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity,
      stock: product.stock,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
    });
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton variant="card" className="aspect-square" />
            <div className="space-y-4">
              <Skeleton variant="text" className="h-8 w-3/4" />
              <Skeleton variant="text" className="h-6 w-1/4" />
              <Skeleton variant="text" className="h-24 w-full" />
              <Skeleton variant="card" className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.compareAtPrice
    ? calculateDiscount(product.price, product.compareAtPrice)
    : 0;
  const stars = generateStarRating(product.rating);
  const isOutOfStock = product.stock === 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link to="/products" className="text-gray-500 hover:text-gray-700">
            Products
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link
            to={`/products?category=${product.categoryId}`}
            className="text-gray-500 hover:text-gray-700"
          >
            {product.category}
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <Badge
                  variant="error"
                  className="absolute top-4 left-4"
                >
                  -{discount}%
                </Badge>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors',
                      selectedImage === index
                        ? 'border-indigo-500'
                        : 'border-transparent hover:border-gray-300'
                    )}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Rating */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {stars.map((star, index) => (
                    <span
                      key={index}
                      className={cn(
                        'text-lg',
                        star === 'full'
                          ? 'text-yellow-400'
                          : star === 'half'
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      )}
                    >
                      ★
                    </span>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                {formatCurrency(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-xl text-gray-400 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div>
              {isOutOfStock ? (
                <Badge variant="error">Out of Stock</Badge>
              ) : product.stock < 10 ? (
                <Badge variant="warning">Only {product.stock} left</Badge>
              ) : (
                <Badge variant="success">In Stock</Badge>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-sm text-gray-600">
              <p className="whitespace-pre-line">{product.description}</p>
            </div>

            {/* Quantity & Add to Cart */}
            {!isOutOfStock && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    size="lg"
                    className="flex-1"
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={cn(isWishlisted && 'text-red-500 border-red-500')}
                  >
                    <Heart
                      className={cn('w-5 h-5', isWishlisted && 'fill-current')}
                    />
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleShare}>
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Truck className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Free Delivery</p>
                  <p className="text-xs text-gray-500">On orders over ₦5,000</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Shield className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                  <p className="text-xs text-gray-500">100% protected</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <RotateCcw className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                  <p className="text-xs text-gray-500">7-day return policy</p>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Sold by</p>
                <p className="font-medium text-gray-900">{product.sellerName}</p>
              </div>
              <Link
                to={`/seller/${product.sellerId}`}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View Store
              </Link>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Related Products
          </h2>
          <ProductGrid products={relatedProducts} columns={4} />
        </section>
      </div>
    </div>
  );
}

export default ProductDetailPage;
