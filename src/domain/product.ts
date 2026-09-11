/**
 * Domain models for the product catalog.
 *
 * These interfaces describe the shape of the data the app works with,
 * independent of the DummyJSON transport layer. The `data` layer is
 * responsible for mapping raw API responses into these types.
 */

/** Number of products fetched per page. */
export const PAGE_SIZE = 20;

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
}

/** A paginated list of products as returned by the DummyJSON list/search endpoints. */
export interface ProductListResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}
