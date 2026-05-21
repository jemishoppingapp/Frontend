import { Suspense } from 'react';
import { Search } from 'lucide-react';
import type { Metadata } from 'next';
import { and, asc, desc, eq, sql, type SQL } from 'drizzle-orm';
import { Container } from '@/components/Container';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton';
import { ProductFilters } from '@/components/product/ProductFilters';
import { ProductPagination } from '@/components/product/ProductPagination';
import { TimeoutDetector } from '@/components/TimeoutDetector';
import { db, schema } from '@/db';
import type { ProductCardData } from '@/components/product/ProductCard';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 24;

type SearchParamsObj = {
  q?: string;
  category?: string;
  sort?: string;
  page?: string;
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParamsObj>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const category = sp.category;
  if (q) {
    return {
      title: `Search: ${q}`,
      description: `Search results for "${q}" on JEMI.`,
      robots: { index: false },
    };
  }
  if (category && category !== 'all') {
    const niceName = category.charAt(0).toUpperCase() + category.slice(1);
    return {
      title: `${niceName} — Shop`,
      description: `Shop ${niceName} on JEMI — LASU campus marketplace.`,
    };
  }
  return {
    title: 'Shop',
    description: 'Browse all products on JEMI — LASU campus marketplace.',
  };
}

async function fetchProducts(args: {
  q?: string;
  category?: string;
  sort: string;
  page: number;
}): Promise<{
  products: ProductCardData[];
  total: number;
  totalPages: number;
}> {
  try {
    const conditions = [eq(schema.products.isActive, true)];
    if (args.category && args.category !== 'all') {
      conditions.push(eq(schema.products.category, args.category));
    }

    let tsqueryExpr: SQL | undefined;
    if (args.q) {
      tsqueryExpr = sql`${schema.products.searchVector}::tsvector @@ plainto_tsquery('english', ${args.q})`;
    }

    let orderBy: SQL[];
    if (args.q && args.sort === 'newest') {
      orderBy = [
        sql`ts_rank_cd(${schema.products.searchVector}::tsvector, plainto_tsquery('english', ${args.q})) DESC`,
        desc(schema.products.createdAt),
      ];
    } else if (args.sort === 'price-asc') {
      orderBy = [asc(schema.products.price)];
    } else if (args.sort === 'price-desc') {
      orderBy = [desc(schema.products.price)];
    } else if (args.sort === 'name-asc') {
      orderBy = [asc(schema.products.name)];
    } else {
      orderBy = [desc(schema.products.createdAt)];
    }

    const where = tsqueryExpr ? and(...conditions, tsqueryExpr) : and(...conditions);
    const skip = (args.page - 1) * PAGE_SIZE;

    const [rows, totalRows] = await Promise.all([
      db()
        .select()
        .from(schema.products)
        .where(where)
        .orderBy(...orderBy)
        .limit(PAGE_SIZE)
        .offset(skip),
      db()
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.products)
        .where(where),
    ]);

    const total = totalRows[0]?.count ?? 0;
    const products: ProductCardData[] = rows.map((d) => ({
      _id: d.id,
      slug: d.slug,
      name: d.name,
      price: Number(d.price),
      originalPrice: d.originalPrice ? Number(d.originalPrice) : undefined,
      imageUrl: d.images?.[0]?.url ?? '',
      imageAlt: d.images?.[0]?.alt ?? d.name,
      seller: d.seller,
      rating: Number(d.rating),
      reviewCount: d.reviewCount,
      inStock: d.inStock,
    }));

    return {
      products,
      total,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[products] fetchProducts failed:', err);
    return { products: [], total: 0, totalPages: 1 };
  }
}

async function ProductsResults({
  q,
  category,
  sort,
  page,
}: {
  q?: string;
  category?: string;
  sort: string;
  page: number;
}) {
  const { products, total, totalPages } = await fetchProducts({ q, category, sort, page });

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-surface-muted mb-4">
          <Search className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          {q ? `No results for "${q}"` : 'No products found'}
        </h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          {q
            ? 'Try a different search term, or remove your category filter.'
            : "There aren't any products in this category yet."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="text-xs text-gray-500 mb-4">
        Showing <span className="font-medium text-gray-700">{products.length}</span> of{' '}
        <span className="font-medium text-gray-700">{total}</span> products
      </div>
      <ProductGrid products={products} />
      <div className="mt-10">
        <ProductPagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/products"
          searchParams={{ q, category, sort }}
        />
      </div>
    </>
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsObj>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const category = sp.category || 'all';
  const sort = sp.sort || 'newest';
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);

  return (
    <Container className="py-6 sm:py-8">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
          {q ? `Search: "${q}"` : category !== 'all' ? capitalize(category) : 'Shop all products'}
        </h1>
        <p className="text-sm text-gray-500">
          Quality products, student-friendly prices, on-campus pickup.
        </p>
      </div>

      <div className="mb-5 sm:mb-6">
        <ProductFilters activeCategory={category} activeSort={sort} />
      </div>

      <Suspense
        fallback={
          <TimeoutDetector>
            <ProductGridSkeleton count={12} />
          </TimeoutDetector>
        }
      >
        <ProductsResults q={q} category={category} sort={sort} page={page} />
      </Suspense>
    </Container>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}