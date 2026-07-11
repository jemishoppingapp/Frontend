/**
 * Drizzle schema — Jemi Postgres layout.
 *
 * Five tables:
 *   users           buyers + admins (role discriminates)
 *   categories      small, mostly-static
 *   products        with weighted tsvector search column
 *   orders          with sub_orders jsonb[] embedded
 *   (no carts table — cart lives in browser localStorage)
 *
 * IDs: uuid via gen_random_uuid() (pgcrypto, enabled by default on Neon).
 * Money: numeric(10, 2) — naira, two decimals. Drizzle reads numeric as
 * string by default; we map to number via a `mode: 'string'` then parse
 * at boundaries (see helpers in db/index.ts).
 *
 * sub_orders: jsonb on the orders row. Sub-orders are never queried
 * independently in v1 — always loaded with the parent order. If
 * multi-vendor "seller dashboard" needs change that, promote to a
 * proper table then.
 */
import {
  pgTable,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  uuid,
  jsonb,
  index,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/* -------------------------------------------------------------------- */
/* Enums                                                                 */
/* -------------------------------------------------------------------- */

export const userRoleEnum = pgEnum('user_role', ['buyer', 'admin', 'seller']);

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'confirmed',
  'processing',
  'ready_for_pickup',
  'completed',
  'cancelled',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'paid',
  'failed',
  'refunded',
  'pay_on_delivery',
  'collected',
]);

/* -------------------------------------------------------------------- */
/* users                                                                 */
/* -------------------------------------------------------------------- */

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 100 }).notNull(),  // bcrypt is 60 chars, room for growth
    name: varchar('name', { length: 100 }).notNull(),
    role: userRoleEnum('role').notNull().default('buyer'),

    // Profile fields — defaults to '' so admin seed doesn't trip required.
    phone: varchar('phone', { length: 20 }).notNull().default(''),
    nickname: varchar('nickname', { length: 100 }).notNull().default(''),
    altPhone: varchar('alt_phone', { length: 20 }).notNull().default(''),
    address: text('address').notNull().default(''),
    department: varchar('department', { length: 100 }).notNull().default(''),
    level: varchar('level', { length: 50 }).notNull().default(''),
    avatar: varchar('avatar', { length: 500 }).notNull().default(''),

    profileCompleted: boolean('profile_completed').notNull().default(false),
    isDisabled: boolean('is_disabled').notNull().default(false),
    /** harden-1: login rate limiting */
    failedLoginAttempts: integer('failed_login_attempts').notNull().default(0),
    lockedUntil: timestamp('locked_until', { withTimezone: true }),
    /** email-1: verification */
    emailVerified: boolean('email_verified').notNull().default(false),
    otpHash: varchar('otp_hash', { length: 100 }).notNull().default(''),
    otpExpiresAt: timestamp('otp_expires_at', { withTimezone: true }),
    otpAttempts: integer('otp_attempts').notNull().default(0),
    otpLastSentAt: timestamp('otp_last_sent_at', { withTimezone: true }),
    otpSendCount: integer('otp_send_count').notNull().default(0),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailUnique: uniqueIndex('users_email_unique').on(t.email),
    profileCompletedIdx: index('users_profile_completed_idx').on(t.profileCompleted),
  })
);

/* -------------------------------------------------------------------- */
/* categories                                                            */
/* -------------------------------------------------------------------- */

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    slug: varchar('slug', { length: 100 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description').notNull().default(''),
    icon: varchar('icon', { length: 50 }).notNull().default(''),
    imageSrc: varchar('image_src', { length: 500 }).notNull().default(''),
    displayOrder: integer('display_order').notNull().default(0),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugUnique: uniqueIndex('categories_slug_unique').on(t.slug),
    displayOrderIdx: index('categories_display_order_idx').on(t.displayOrder),
  })
);

/* -------------------------------------------------------------------- */
/* products                                                              */
/* -------------------------------------------------------------------- */

/**
 * Product images are stored as jsonb array. Each entry:
 *   { publicId: string, url: string, alt: string }
 */
export interface ProductImage {
  publicId: string;
  url: string;
  alt: string;
}

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    description: text('description').notNull().default(''),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    /** pod-1: JEMI margin %. Seller gets (100 - margin)% of list price. Default 5, overridable. */
    marginPercent: numeric('margin_percent', { precision: 5, scale: 2 }).notNull().default('5'),
    originalPrice: numeric('original_price', { precision: 10, scale: 2 }),
    images: jsonb('images').$type<ProductImage[]>().notNull().default([]),
    category: varchar('category', { length: 100 }).notNull(),
    inStock: boolean('in_stock').notNull().default(true),
    stockQuantity: integer('stock_quantity').notNull().default(0),
    rating: numeric('rating', { precision: 3, scale: 2 }).notNull().default('0'),
    reviewCount: integer('review_count').notNull().default(0),
    features: jsonb('features').$type<string[]>().notNull().default([]),
    color: varchar('color', { length: 50 }).notNull().default(''),
    seller: varchar('seller', { length: 100 }).notNull().default('JEMI Store'),
    sellerId: uuid('seller_id').references(() => sellers.id, { onDelete: 'set null' }),
    isActive: boolean('is_active').notNull().default(true),
    isFeatured: boolean('is_featured').notNull().default(false),

    // Weighted tsvector — Postgres equivalent of the Mongo $text index.
    // Generated column updated automatically when name/description/category
    // change. Weights: name(A)=1.0, description(B)=0.4, category(C)=0.2.
    // We rebuild the column via SQL since Drizzle's typed API doesn't yet
    // express generated tsvector columns naturally. See db/index.ts for
    // the post-migration `executeSetup()` helper.
    searchVector: text('search_vector'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugUnique: uniqueIndex('products_slug_unique').on(t.slug),
    activeCategoryCreatedIdx: index('products_active_category_created_idx').on(
      t.isActive,
      t.category,
      t.createdAt
    ),
    activeFeaturedIdx: index('products_active_featured_idx').on(
      t.isActive,
      t.isFeatured,
      t.createdAt
    ),
  })
);

/* -------------------------------------------------------------------- */
/* orders                                                                */
/* -------------------------------------------------------------------- */

export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  quantity: number;
  seller: string;
}

export interface SubOrder {
  subOrderNumber: string;
  sellerName: string;
  items: OrderItem[];
  subtotal: number;
  status: 'pending' | 'confirmed' | 'processing' | 'ready_for_pickup' | 'completed' | 'cancelled';
  pickupCode: string;
  pickupCodeUsed: boolean;
}

export interface OrderTimelineEntry {
  status: string;
  timestamp: string;
  note: string;
}

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
    orderNumber: varchar('order_number', { length: 50 }).notNull(),
    subOrders: jsonb('sub_orders').$type<SubOrder[]>().notNull().default([]),
    subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
    deliveryFee: numeric('delivery_fee', { precision: 10, scale: 2 }).notNull().default('0'),
    total: numeric('total', { precision: 10, scale: 2 }).notNull(),
    status: orderStatusEnum('status').notNull().default('pending'),
    paymentStatus: paymentStatusEnum('payment_status').notNull().default('pending'),
    paymentMethod: varchar('payment_method', { length: 50 }).notNull().default('paystack'),
    paystackReference: varchar('paystack_reference', { length: 100 }).notNull().default(''),
    /** pod-1: what JEMI's rep collected at the gate */
    podCollectedAmount: numeric('pod_collected_amount', { precision: 10, scale: 2 }),
    podCollectedMethod: varchar('pod_collected_method', { length: 20 }).notNull().default(''),
    podCollectedAt: timestamp('pod_collected_at', { withTimezone: true }),
    deliveryZone: varchar('delivery_zone', { length: 100 }).notNull(),
    deliveryDescription: text('delivery_description').notNull().default(''),
    customerNote: text('customer_note').notNull().default(''),
    timeline: jsonb('timeline').$type<OrderTimelineEntry[]>().notNull().default([]),
    /** install-14: seller delivery marks for dual-confirm. Shape:
     *    { [sellerId]: { deliveredAt: ISO, deliveredBy: userId } }
     *  Each seller stamps when they hand over their items at pickup. */
    sellerDeliveryMarks: jsonb('seller_delivery_marks').notNull().default({}),
    /** install-15: buyer confirmed receipt at this time */
    buyerReceivedAt: timestamp('buyer_received_at', { withTimezone: true }),
    /** install-15: derived escrow state. held/released/refunded/mixed/awaiting_review */
    escrowStatus: varchar('escrow_status', { length: 30 }).notNull().default('held'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    orderNumberUnique: uniqueIndex('orders_order_number_unique').on(t.orderNumber),
    userCreatedIdx: index('orders_user_created_idx').on(t.userId, t.createdAt),
    statusIdx: index('orders_status_idx').on(t.status),
    paymentStatusIdx: index('orders_payment_status_idx').on(t.paymentStatus),
    // Partial unique on paystackReference (Postgres equivalent of Mongo's
    // sparse unique). Empty string is the default before init.
    paystackRefUnique: uniqueIndex('orders_paystack_ref_unique')
      .on(t.paystackReference)
      .where(sql`${t.paystackReference} <> ''`),
  })
);

/* -------------------------------------------------------------------- */
/* Type helpers                                                          */
/* -------------------------------------------------------------------- */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
// ============================================================
// Sellers — install-12
// ============================================================
export const payoutCadenceEnum = pgEnum('payout_cadence', ['weekly', 'monthly']);

export const sellerStatusEnum = pgEnum('seller_status', [
  'pending',     // application submitted, awaiting admin review
  'approved',    // active, can list products
  'suspended',   // temporarily blocked by admin
  'rejected',    // application denied
]);

export const sellers = pgTable(
  'sellers',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),

    // Business
    businessName: varchar('business_name', { length: 200 }).notNull(),
    businessTypeCategory: varchar('business_type_category', { length: 50 }).notNull(),
    businessTypeNotes: text('business_type_notes').notNull().default(''),
    businessAddress: text('business_address').notNull(),
    businessPhone: varchar('business_phone', { length: 20 }).notNull(),

    // Bank (for Paystack subaccount creation in install-15)
    bankAccountName: varchar('bank_account_name', { length: 200 }).notNull(),
    bankAccountNumber: varchar('bank_account_number', { length: 20 }).notNull(),
    bankCode: varchar('bank_code', { length: 10 }).notNull(),
    bankName: varchar('bank_name', { length: 200 }).notNull(),

    // Paystack subaccount (created on approval — install-15)
    paystackSubaccountCode: varchar('paystack_subaccount_code', { length: 100 }).notNull().default(''),
    platformFeePercent: numeric('platform_fee_percent', { precision: 5, scale: 2 }).notNull().default('5.00'),
    /** install-17: how often this seller wants payouts */
    payoutCadence: payoutCadenceEnum('payout_cadence').notNull().default('weekly'),

    // Future KYC (added now as nullable to avoid breaking migration later)
    kycNin: varchar('kyc_nin', { length: 20 }),
    kycBvn: varchar('kyc_bvn', { length: 20 }),
    kycIdDocUrl: text('kyc_id_doc_url'),

    // Status
    status: sellerStatusEnum('status').notNull().default('pending'),
    appliedAt: timestamp('applied_at', { withTimezone: true }).notNull().defaultNow(),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    approvedBy: uuid('approved_by').references(() => users.id),
    rejectionReason: text('rejection_reason').notNull().default(''),

    // Audit
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusIdx: index('sellers_status_idx').on(t.status),
    userIdIdx: index('sellers_user_id_idx').on(t.userId),
  })
);


// ============================================================
// Escrow — install-15
// ============================================================
export const escrowLedgerTypeEnum = pgEnum('escrow_ledger_type', [
  'hold',          // money received from buyer, owed to seller
  'release',       // moved from held to seller's available balance
  'platform_fee',  // 5% taken at release
  'refund',        // returned to buyer (abandoned or dispute)
  'payout',        // admin-triggered transfer to seller's bank (install-17)
]);

export const escrowLedger = pgTable(
  'escrow_ledger',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    type: escrowLedgerTypeEnum('type').notNull(),

    // Relations — nullable depending on entry type:
    //   hold/release/platform_fee/payout: orderId + sellerId
    //   refund: orderId (no seller — money goes back to buyer)
    orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'restrict' }),
    sellerId: uuid('seller_id').references(() => sellers.id, { onDelete: 'restrict' }),

    // Amount in naira (numeric, like products.price)
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),

    // Free-form note / reference (payout reference, refund reason, etc)
    note: text('note').notNull().default(''),

    // For payouts: external transfer reference (Paystack transfer code, bank ref)
    externalRef: varchar('external_ref', { length: 200 }).notNull().default(''),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: uuid('created_by').references(() => users.id),
  },
  (t) => ({
    orderIdx: index('escrow_ledger_order_idx').on(t.orderId),
    sellerIdx: index('escrow_ledger_seller_idx').on(t.sellerId),
    typeIdx: index('escrow_ledger_type_idx').on(t.type),
  })
);

// ============================================================
// Payouts — install-17
// ============================================================

export const payoutStatusEnum = pgEnum('payout_status', [
  'pending',    // created, money not confirmed sent yet (manual mode)
  'processing', // Paystack transfer initiated, awaiting completion
  'completed',  // money confirmed sent
  'failed',     // transfer failed
]);

export const payoutMethodEnum = pgEnum('payout_method', ['manual', 'paystack']);

export const payouts = pgTable(
  'payouts',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    sellerId: uuid('seller_id').notNull().references(() => sellers.id, { onDelete: 'restrict' }),

    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    method: payoutMethodEnum('method').notNull(),
    status: payoutStatusEnum('status').notNull().default('pending'),

    // Paystack transfer code / bank reference
    transferRef: varchar('transfer_ref', { length: 200 }).notNull().default(''),
    // Snapshot of bank details at payout time (in case seller changes them later)
    bankSnapshot: jsonb('bank_snapshot').notNull().default({}),

    note: text('note').notNull().default(''),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (t) => ({
    sellerIdx: index('payouts_seller_idx').on(t.sellerId),
    statusIdx: index('payouts_status_idx').on(t.status),
  })
);
