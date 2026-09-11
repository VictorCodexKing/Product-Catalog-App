import { useCallback, useEffect, useRef, useState } from 'react';

import { productRepository } from '../../data/productRepository';
import type { ProductListResponse } from '../../domain/product';
import {
  INITIAL_STATE,
  appendPage,
  canLoadMore,
  deriveHasMore,
  resolveLoadMoreError,
  type ProductsState,
} from './productsState';

export type { ProductsState, ProductsStatus } from './productsState';

/** The state plus the actions the UI can trigger. */
export interface UseProductsResult extends ProductsState {
  loadMore: () => void;
  retry: () => void;
  refresh: () => void;
  /** Re-attempts the next page after a load-more failure. */
  retryLoadMore: () => void;
}

/**
 * Loads a zero-based page from the repository, choosing the browse or search
 * endpoint depending on whether a query is present.
 */
function fetchPage(query: string, page: number): Promise<ProductListResponse> {
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
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const loadFirstPage = useCallback(
    async (q: string, mode: 'initial' | 'refresh') => {
      const requestId = ++requestIdRef.current;

      setState((prev) => ({
        ...prev,
        status: mode === 'initial' ? 'loading' : prev.status,
        refreshing: mode === 'refresh',
        error: null,
        loadMoreError: null,
      }));

      try {
        const response = await fetchPage(q, 0);
        if (requestId !== requestIdRef.current) {
          return;
        }
        const loaded = response.products.length;
        setState((prev) => ({
          ...prev,
          status: loaded === 0 ? 'empty' : 'success',
          products: response.products,
          page: 0,
          hasMore: deriveHasMore(loaded, loaded, response.total),
          refreshing: false,
          loadingMore: false,
          error: null,
          loadMoreError: null,
        }));
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

  // Fires the next-page fetch as a plain side effect (never from inside a
  // setState updater). Eligibility is read from stateRef, and loadingMore is
  // flipped in state before the request goes out. Reading the guard from a ref
  // (rather than the updater's `prev`) avoids double-firing under StrictMode,
  // which invokes updaters twice.
  const startLoadMore = useCallback(() => {
    if (!canLoadMore(stateRef.current)) {
      return;
    }

    const nextPage = stateRef.current.page + 1;
    const requestId = ++requestIdRef.current;

    setState((prev) => ({ ...prev, loadingMore: true, loadMoreError: null }));

    fetchPage(query, nextPage)
      .then((response) => {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setState((current) => appendPage(current, response, nextPage));
      })
      .catch((err: unknown) => {
        if (requestId !== requestIdRef.current) {
          return;
        }
        const error = err instanceof Error ? err : new Error(String(err));
        setState((current) => resolveLoadMoreError(current, error));
      });
  }, [query]);

  const loadMore = useCallback(() => {
    // A pending load-more error suppresses scroll-triggered auto-loading so the
    // user is not silently retried; recovery is explicit via retryLoadMore.
    if (stateRef.current.loadMoreError) {
      return;
    }
    startLoadMore();
  }, [startLoadMore]);

  const retryLoadMore = useCallback(() => {
    startLoadMore();
  }, [startLoadMore]);

  const retry = useCallback(() => {
    loadFirstPage(query, 'initial');
  }, [query, loadFirstPage]);

  const refresh = useCallback(() => {
    loadFirstPage(query, 'refresh');
  }, [query, loadFirstPage]);

  return { ...state, loadMore, retry, refresh, retryLoadMore };
}
