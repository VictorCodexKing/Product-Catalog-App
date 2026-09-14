/**
 * Domain models for the product catalog.
 *
 * These interfaces describe the shape of the data the app works with,
 * independent of the DummyJSON transport layer. The `data` layer is
 * responsible for mapping raw API responses into these types.
 */

/** Number of products fetched per page. */
export const PAGE_SIZE = 20;

/** Physical dimensions of a product (in the units DummyJSON reports). */
export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

/** A single customer review for a product. */
export interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

/** A single product in the catalog. */
export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  thumbnail: string;
  images: string[];
  brand?: string;
  category?: string;
  stock?: number;
  discountPercentage?: number;
  tags: string[];
  /** Human-readable stock status, e.g. "In Stock" / "Low Stock" / "Out of Stock". */
  availabilityStatus?: string;
  weight?: number;
  dimensions?: Dimensions;
  warrantyInformation?: string;
  shippingInformation?: string;
  reviews: Review[];
}

/** A paginated list of products as returned by the DummyJSON list/search endpoints. */
export interface ProductListResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

/** A selectable product category. */
export interface Category {
  /** API slug used for filtering, e.g. "home-decoration". */
  slug: string;
  /** Human-readable label, e.g. "Home Decoration". */
  name: string;
}

/**
 * Derives whether a product is considered in stock.
 *
 * Prefers the API-provided `availabilityStatus` string when present (treating
 * anything containing "out" as out of stock), and falls back to the numeric
 * `stock` count otherwise. Pure business logic, kept in the domain layer so it
 * can be unit tested and reused by any UI.
 */
export function isInStock(product: Pick<Product, 'availabilityStatus' | 'stock'>): boolean {
  const status = product.availabilityStatus?.trim().toLowerCase();
  if (status) {
    return !status.includes('out');
  }
  return (product.stock ?? 0) > 0;
}

/** Returns a normalised, human-readable availability label for a product. */
export function availabilityLabel(
  product: Pick<Product, 'availabilityStatus' | 'stock'>,
): string {
  if (product.availabilityStatus && product.availabilityStatus.trim().length > 0) {
    return product.availabilityStatus.trim();
  }
  return isInStock(product) ? 'In Stock' : 'Out of Stock';
}

/**
 * Computes the pre-discount (original) price from a current price and discount
 * percentage. Returns `null` when there is no meaningful discount.
 */
export function originalPrice(
  price: number,
  discountPercentage?: number,
): number | null {
  if (!discountPercentage || discountPercentage <= 0) {
    return null;
  }
  return price / (1 - discountPercentage / 100);
}


/** Availability filter options for the product list. */
export type StatusFilter = 'all' | 'in-stock' | 'out-of-stock';

/**
 * Filters a list of products by availability status and category.
 *
 * Both filters are optional: `status: 'all'` and `category: null` are no-ops.
 * Category comparison is case-insensitive. Pure function kept in the domain
 * layer so the filtering rules can be unit tested independently of the UI.
 */
export function filterProducts(
  products: Product[],
  status: StatusFilter,
  category: string | null,
): Product[] {
  return products.filter((product) => {
    if (status === 'in-stock' && !isInStock(product)) {
      return false;
    }
    if (status === 'out-of-stock' && isInStock(product)) {
      return false;
    }
    if (
      category &&
      (product.category ?? '').toLowerCase() !== category.toLowerCase()
    ) {
      return false;
    }
    return true;
  });
}

/** Returns the distinct, sorted list of categories present in a product list. */
export function uniqueCategories(products: Product[]): string[] {
  const set = new Set<string>();
  for (const product of products) {
    if (product.category) {
      set.add(product.category);
    }
  }
  return Array.from(set).sort();
}
