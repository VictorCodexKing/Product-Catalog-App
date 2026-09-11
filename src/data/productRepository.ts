import * as api from './api';
import { PAGE_SIZE, type Product, type ProductListResponse } from '../domain/product';

/**
 * Maps a raw API product into the domain `Product` shape, defensively
 * normalising the fields the UI relies on.
 */
function mapProduct(raw: Product): Product {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    price: raw.price,
    rating: raw.rating,
    thumbnail: raw.thumbnail,
    images: Array.isArray(raw.images) ? raw.images : [],
    brand: raw.brand,
    category: raw.category,
    stock: raw.stock,
    discountPercentage: raw.discountPercentage,
  };
}

/** Maps a raw list response into a domain `ProductListResponse`. */
function mapListResponse(raw: ProductListResponse): ProductListResponse {
  return {
    products: (raw.products ?? []).map(mapProduct),
    total: raw.total,
    skip: raw.skip,
    limit: raw.limit,
  };
}

/**
 * The repository is the single entry point the presentation layer uses to read
 * product data. It hides pagination arithmetic and response mapping.
 */
export const productRepository = {
  /** Loads a zero-based page of products. */
  async getProducts(page: number): Promise<ProductListResponse> {
    const skip = page * PAGE_SIZE;
    const raw = await api.fetchProducts({ limit: PAGE_SIZE, skip });
    return mapListResponse(raw);
  },

  /** Loads a single product by id. */
  async getProduct(id: number): Promise<Product> {
    const raw = await api.fetchProductById(id);
    return mapProduct(raw);
  },

  /** Searches products by query, paginated by zero-based `page`. */
  async search(query: string, page: number): Promise<ProductListResponse> {
    const skip = page * PAGE_SIZE;
    const raw = await api.searchProducts({ q: query, limit: PAGE_SIZE, skip });
    return mapListResponse(raw);
  },
};

export type ProductRepository = typeof productRepository;
