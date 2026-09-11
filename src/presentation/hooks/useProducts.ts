import { useCallback, useEffect, useRef, useState } from 'react';

import { productRepository } from '../../data/productRepository';
import type { Product } from '../../domain/product';

/** The high-level status of the product list, driving which view is rendered. */
export type ProductsStatus = 'loading' | 'error' | 'empty' | 'success';

/** The full state exposed by {@link useProducts}. */
export interface ProductsState {
  status: ProductsStatus;
  products: Product[];
  page: number;
  hasMore: boolean;
  /** True while a pull-to-refresh is in flight. */
  refreshing: boolean;
  /** True while an additional page is being appended. */
  loadingMore: boolean;
  error: Error | null;
}

/** The state plus the actions the UI can trigger. */
export interface UseProductsResult extends ProductsState {
  loadMore: () => void;
  retry: () => void;
  refresh: () => void;
}

const INITIAL_STATE: ProductsState = {
  status: 'loading',
  products: [],
  page: 0,
  hasMore: false,
  refreshing: false,
  loadingMore: false,
  error: null,
};

/**
 * Loads a zero-based page from the repository, choosing the browse or search
 * endpoint depending on whether a query is present.
 */
function fetchPage(query: string, page: number) {
  const trimmed = query.trim();
  return trimmed.length > 0
    ? productRepository.search(trimmed, page)
    : productRepository.getProducts(page);
}

/**
 * Manages the product list state machine: initial load, pagination via
 * `loadMore`, error recovery via `retry`, and pull-to-refresh via `refresh`.
 * When `query` changes the list resets to page 0. Search uses the server-side
 * DummyJSON `/products/search` endpoint (via `productRepository.search`).
 */
export function useProducts(query: string): UseProductsResult {
  const [state, setState] = useState<ProductsState>(INITIAL_STATE);

  // Guards against out-of-order responses when the query changes mid-flight.
  const requestIdRef = useRef(0);

  const loadFirstPage = useCallback(
    async (q: string, mode: 'initial' | 'refresh') => {
      const requestId = ++requestIdRef.current;

      setState((prev) => ({
        ...prev,
        status: mode === 'initial' ? 'loading' : prev.status,
        refreshing: mode === 'refresh',
        error: null,
      }));

      try {
        const response = await fetchPage(q, 0);
        if (requestId !== requestIdRef.current) {
          return;
        }
        const loaded = response.products.length;
        setState({
          status: loaded === 0 ? 'empty' : 'success',
          products: response.products,
          page: 0,
          hasMore: loaded < response.total,
          refreshing: false,
          loadingMore: false,
          error: null,
        });
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setState((prev) => ({
          ...prev,
          status: 'error',
          refreshing: false,
          loadingMore: false,
          error: err instanceof Error ? err : new Error(String(err)),
        }));
      }
    },
    [],
  );

  // (Re)load the first page whenever the (debounced) query changes.
  useEffect(() => {
    loadFirstPage(query, 'initial');
  }, [query, loadFirstPage]);

  const loadMore = useCallback(() => {
    setState((prev) => {
      if (
        prev.status !== 'success' ||
        !prev.hasMore ||
        prev.loadingMore ||
        prev.refreshing
      ) {
        return prev;
      }

      const nextPage = prev.page + 1;
      const requestId = ++requestIdRef.current;

      fetchPage(query, nextPage)
        .then((response) => {
          if (requestId !== requestIdRef.current) {
            return;
          }
          setState((current) => {
            const products = [...current.products, ...response.products];
            return {
              ...current,
              products,
              page: nextPage,
              hasMore: products.length < response.total,
              loadingMore: false,
            };
          });
        })
        .catch((err: unknown) => {
          if (requestId !== requestIdRef.current) {
            return;
          }
          setState((current) => ({
            ...current,
            loadingMore: false,
            error: err instanceof Error ? err : new Error(String(err)),
          }));
        });

      return { ...prev, loadingMore: true };
    });
  }, [query]);

  const retry = useCallback(() => {
    loadFirstPage(query, 'initial');
  }, [query, loadFirstPage]);

  const refresh = useCallback(() => {
    loadFirstPage(query, 'refresh');
  }, [query, loadFirstPage]);

  return { ...state, loadMore, retry, refresh };
}
