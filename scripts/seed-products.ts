/**
 * Idempotent seed: 24 starter products. Upsert by slug.
 *
 * Usage:
 *   npm run seed:products
 */
import { db, schema } from '@/db';
import { slugify } from '@/lib/utils';

interface SeedProduct {
  name: string;
  category: 'fashion' | 'electronics' | 'food' | 'accessories';
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  rating: number;
  reviewCount: number;
  stockQuantity: number;
  isFeatured?: boolean;
}

const PRODUCTS: SeedProduct[] = [
  // Fashion
  { name: 'Premium Cotton T-Shirt', category: 'fashion', price: 4500, originalPrice: 6000, description: 'Soft, breathable cotton tee. A wardrobe staple that pairs with everything from jeans to chinos.', features: ['100% combed cotton', 'Pre-shrunk', 'Reinforced stitching'], rating: 4.5, reviewCount: 124, stockQuantity: 50, isFeatured: true },
  { name: 'Slim-Fit Jeans', category: 'fashion', price: 12500, description: 'Classic dark wash slim-fit jeans. Versatile enough for class or a night out.', features: ['Stretch denim', 'Five-pocket styling', 'Mid-rise'], rating: 4.3, reviewCount: 87, stockQuantity: 30, isFeatured: true },
  { name: 'Canvas Sneakers', category: 'fashion', price: 9800, originalPrice: 12000, description: 'Low-top canvas sneakers with a cushioned insole. Lightweight and comfortable for long walks.', features: ['Breathable canvas upper', 'Rubber sole', 'Lace-up closure'], rating: 4.6, reviewCount: 213, stockQuantity: 25, isFeatured: true },
  { name: 'Hooded Sweatshirt', category: 'fashion', price: 8500, description: 'Cozy fleece-lined hoodie. Drawstring hood and front kangaroo pocket.', features: ['Fleece-lined', 'Ribbed cuffs and hem', 'Drawstring hood'], rating: 4.4, reviewCount: 156, stockQuantity: 40 },
  { name: 'Athletic Shorts', category: 'fashion', price: 4200, description: 'Quick-dry shorts with side pockets. Great for the gym or casual wear.', features: ['Quick-dry fabric', 'Elastic waistband', 'Side pockets'], rating: 4.2, reviewCount: 92, stockQuantity: 60 },
  { name: 'Patterned Button-Up Shirt', category: 'fashion', price: 7800, description: 'Lightweight short-sleeve shirt in a subtle pattern. Smart enough for class, relaxed enough for outings.', features: ['100% cotton', 'Two-button cuff', 'Curved hem'], rating: 4.1, reviewCount: 64, stockQuantity: 35 },
  // Electronics
  { name: 'Wireless Bluetooth Earbuds', category: 'electronics', price: 18500, originalPrice: 24000, description: 'True wireless earbuds with active noise cancellation. 8 hours of playback per charge, 32 hours with the case.', features: ['Active noise cancellation', 'Bluetooth 5.3', 'IPX5 sweat-resistant', 'USB-C charging'], rating: 4.7, reviewCount: 432, stockQuantity: 20, isFeatured: true },
  { name: 'Power Bank 20,000mAh', category: 'electronics', price: 12000, description: 'High-capacity power bank with fast charging on both USB-C and USB-A. Charges most phones 4-5 times.', features: ['20,000mAh capacity', '22.5W fast charging', 'Dual USB-C + USB-A', 'LED indicator'], rating: 4.5, reviewCount: 298, stockQuantity: 35, isFeatured: true },
  { name: 'Bluetooth Speaker', category: 'electronics', price: 9500, description: 'Portable Bluetooth speaker with deep bass and 12-hour battery life. Splash-proof for poolside or rain.', features: ['12-hour battery', 'IPX4 splash-proof', 'Built-in mic for calls'], rating: 4.3, reviewCount: 178, stockQuantity: 25 },
  { name: 'Phone Cooling Fan', category: 'electronics', price: 6500, description: 'Magnetic phone cooler that keeps your device from overheating during gaming sessions or long calls.', features: ['Magnetic attachment', 'Semiconductor cooling', 'RGB lighting', 'USB-C powered'], rating: 4.0, reviewCount: 56, stockQuantity: 18 },
  { name: 'Mechanical Keyboard', category: 'electronics', price: 22000, originalPrice: 28000, description: '60% layout mechanical keyboard with hot-swappable switches. RGB backlight and aluminium frame.', features: ['60% compact layout', 'Hot-swappable switches', 'Per-key RGB', 'Aluminium frame'], rating: 4.8, reviewCount: 89, stockQuantity: 12 },
  { name: 'Webcam 1080p', category: 'electronics', price: 14500, description: 'Plug-and-play 1080p HD webcam with built-in microphone. Great for online classes and meetings.', features: ['1080p @ 30fps', 'Built-in microphone', 'Plug-and-play USB', 'Privacy cover'], rating: 4.2, reviewCount: 134, stockQuantity: 22 },
  // Food & Drinks
  { name: 'Instant Noodles (Box of 40)', category: 'food', price: 8500, originalPrice: 10000, description: 'A full carton of campus-favorite instant noodles. Stock the hostel cupboard for a whole semester.', features: ['40 packs per box', 'Mixed flavors', 'Ready in 3 minutes'], rating: 4.6, reviewCount: 512, stockQuantity: 80, isFeatured: true },
  { name: 'Energy Drink Pack (12-pack)', category: 'food', price: 7200, description: 'Twelve-pack of energy drinks for those late-night study sessions. Mixed berry flavor.', features: ['12 cans', '250ml each', 'Mixed berry'], rating: 4.2, reviewCount: 187, stockQuantity: 45 },
  { name: 'Cereal Bowl Bundle', category: 'food', price: 6800, description: 'Two boxes of breakfast cereal plus a 1L pack of long-life milk. Quick mornings sorted.', features: ['2 cereal boxes', '1L UHT milk', 'No refrigeration needed before opening'], rating: 4.1, reviewCount: 76, stockQuantity: 30 },
  { name: 'Biscuit Variety Pack', category: 'food', price: 3500, description: 'Assorted local biscuits — sweet, savory, cream-filled. The whole hostel will end up borrowing some.', features: ['Assorted varieties', '10 packs included', 'Long shelf-life'], rating: 4.3, reviewCount: 245, stockQuantity: 65 },
  { name: 'Bottled Water (Pack of 24)', category: 'food', price: 4500, description: 'Twenty-four bottles of pure table water. Skip the queue at the water tap.', features: ['24 × 75cl bottles', 'Sealed for freshness'], rating: 4.4, reviewCount: 312, stockQuantity: 100 },
  { name: 'Snack Bundle (Crisps + Drinks)', category: 'food', price: 5200, description: 'Six bags of crisps and six soft drinks. Movie-night ready.', features: ['6 crisp bags', '6 × 35cl soft drinks', 'Mixed flavors'], rating: 4.5, reviewCount: 168, stockQuantity: 50 },
  // Accessories
  { name: 'Canvas Backpack', category: 'accessories', price: 14500, originalPrice: 18000, description: 'Roomy canvas backpack with padded laptop sleeve and water bottle pockets. Holds 15.6-inch laptops.', features: ['Padded 15.6" laptop sleeve', 'Two water bottle pockets', 'Adjustable straps', 'Water-resistant'], rating: 4.7, reviewCount: 421, stockQuantity: 25, isFeatured: true },
  { name: 'Leather Wallet', category: 'accessories', price: 6500, description: 'Slim bi-fold wallet in genuine leather. Holds 6 cards plus cash without bulking up your pocket.', features: ['Genuine leather', 'RFID-blocking', '6 card slots', 'Bi-fold design'], rating: 4.4, reviewCount: 156, stockQuantity: 40 },
  { name: 'Sunglasses (UV400)', category: 'accessories', price: 4800, description: 'Classic black-frame sunglasses with full UV400 protection. Lightweight and comfortable for all-day wear.', features: ['UV400 protection', 'Lightweight frame', 'Hard case included'], rating: 4.2, reviewCount: 98, stockQuantity: 50 },
  { name: 'Wristwatch (Analog)', category: 'accessories', price: 12500, description: 'Minimal analog wristwatch with stainless-steel band. Water-resistant to 30m.', features: ['Stainless-steel band', '30m water resistant', 'Quartz movement'], rating: 4.5, reviewCount: 134, stockQuantity: 18 },
  { name: 'Cap (Embroidered Logo)', category: 'accessories', price: 3500, description: 'Cotton baseball cap with adjustable strap. One size fits most.', features: ['100% cotton', 'Adjustable strap', 'Curved brim'], rating: 4.1, reviewCount: 72, stockQuantity: 80 },
  { name: 'Crossbody Bag', category: 'accessories', price: 8500, description: 'Compact crossbody bag with multiple compartments. Just enough room for phone, wallet, and a small notebook.', features: ['Adjustable crossbody strap', '3 zip compartments', 'Lightweight'], rating: 4.3, reviewCount: 145, stockQuantity: 35 },
];

function unsplashUrl(seedString: string): string {
  return `https://source.unsplash.com/600x600/?${encodeURIComponent(seedString)}`;
}

async function main() {
  let created = 0;
  let updated = 0;

  for (const p of PRODUCTS) {
    const slug = slugify(p.name);
    const imageUrl = unsplashUrl(`${p.category},${p.name.split(' ')[0]}`);

    const row = {
      name: p.name,
      slug,
      description: p.description,
      price: String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : null,
      images: [{ publicId: '', url: imageUrl, alt: p.name }],
      category: p.category,
      inStock: p.stockQuantity > 0,
      stockQuantity: p.stockQuantity,
      rating: String(p.rating),
      reviewCount: p.reviewCount,
      features: p.features,
      seller: 'JEMI Store',
      isActive: true,
      isFeatured: p.isFeatured ?? false,
      updatedAt: new Date(),
    };

    const result = await db()
      .insert(schema.products)
      .values(row)
      .onConflictDoUpdate({ target: schema.products.slug, set: row })
      .returning({ id: schema.products.id });

    // We can't easily tell inserted vs updated from onConflictDoUpdate.
    // Approximate: check if a row was already there before by counting.
    if (result.length > 0) {
      created++;  // counts both new and updated as "processed"
    }
    // eslint-disable-next-line no-console
    console.log(`  ↻ ${slug.padEnd(40)} done`);
  }

  // eslint-disable-next-line no-console
  console.log(`\nDone. ${PRODUCTS.length} products upserted.`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  process.exit(1);
});