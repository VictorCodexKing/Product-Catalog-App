import type { Product, ProductListResponse } from '../domain/product';

/** Base URL for the free DummyJSON API (no key required). */
export const BASE_URL = 'https://dummyjson.com';

/**
 * Performs a typed GET request against the given path and throws a descriptive
 * error on any non-2xx response.
 */
async function getJson<T>(path: string): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Request to ${url} failed with status ${response.status} ${response.statusText}`.trim(),
    );
  }

  return (await response.json()) as T;
}

/** Fetches a page of products. GET /products?limit=&skip= */
export function fetchProducts({
  limit,
  skip,
}: {
  limit: number;
  skip: number;
}): Promise<ProductListResponse> {
  return getJson<ProductListResponse>(`/products?limit=${limit}&skip=${skip}`);
}

/** Fetches a single product by id. GET /products/{id} */
export function fetchProductById(id: number): Promise<Product> {
  return getJson<Product>(`/products/${id}`);
}

/** Searches products by query. GET /products/search?q=&limit=&skip= */
export function searchProducts({
  q,
  limit,
  skip,
}: {
  q: string;
  limit: number;
  skip: number;
}): Promise<ProductListResponse> {
  const query = encodeURIComponent(q);
  return getJson<ProductListResponse>(
    `/products/search?q=${query}&limit=${limit}&skip=${skip}`,
  );
}

/** A product category as returned by DummyJSON. */
export interface RawCategory {
  slug: string;
  name: string;
  url: string;
}

/** Fetches the full list of product categories. GET /products/categories */
export function fetchCategories(): Promise<RawCategory[]> {
  return getJson<RawCategory[]>('/products/categories');
}

/** Fetches a page of products within a category. GET /products/category/{slug} */
export function fetchProductsByCategory({
  slug,
  limit,
  skip,
}: {
  slug: string;
  limit: number;
  skip: number;
}): Promise<ProductListResponse> {
  const encoded = encodeURIComponent(slug);
  return getJson<ProductListResponse>(
    `/products/category/${encoded}?limit=${limit}&skip=${skip}`,
  );
}
