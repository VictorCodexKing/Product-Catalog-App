import { PAGE_SIZE, type Product, type ProductListResponse } from '../../domain/product';

/** The high-level status of the product list, driving which view is rendered. */
export type ProductsStatus = 'loading' | 'error' | 'empty' | 'success';

/** The full state exposed by the products hook. */
export interface ProductsState {
  status: ProductsStatus;
  products: Product[];
  page: number;
  hasMore: boolean;
  /** True while a pull-to-refresh is in flight. */
  refreshing: boolean;
  /** True while an additional page is being appended. */
  loadingMore: boolean;
  /** A first-page (initial/retry/refresh) error, rendered as the error view. */
  error: Error | null;
  /**
   * A load-more (pagination) failure. Kept separate from {@link error} so the
   * list stays visible while a footer-level "tap to retry" affordance is shown.
   */
  loadMoreError: Error | null;
}

export const INITIAL_STATE: ProductsState = {
  status: 'loading',
  products: [],
  page: 0,
  hasMore: false,
  refreshing: false,
  loadingMore: false,
  error: null,
  loadMoreError: null,
};

/**
 * Whether there are more pages to load after receiving `pageProducts`, given
 * the total accumulated count and the reported total.
 *
 * A page shorter than {@link PAGE_SIZE} (including an empty page) is treated as
 * end-of-list regardless of `total`: the search endpoint in particular can
 * report a `total` that disagrees with the paginated slice, and without this
 * guard `onEndReached` could re-fire forever against the same offset.
 */
export function deriveHasMore(
  pageProductCount: number,
  accumulatedCount: number,
  total: number,
): boolean {
  if (pageProductCount < PAGE_SIZE) {
    return false;
  }
  return accumulatedCount < total;
}

/**
 * Resolves the state after the first page (initial load, retry, or refresh)
 * comes back successfully. Chooses between the empty and success views.
 */
export function resolveFirstPage(response: ProductListResponse): ProductsState {
  const loaded = response.products.length;
  return {
    status: loaded === 0 ? 'empty' : 'success',
    products: response.products,
    page: 0,
    hasMore: deriveHasMore(loaded, loaded, response.total),
    refreshing: false,
    loadingMore: false,
    error: null,
    loadMoreError: null,
  };
}

/** Marks the first page (initial load, retry, or refresh) as failed. */
export function resolveFirstPageError(prev: ProductsState, error: Error): ProductsState {
  return {
    ...prev,
    status: 'error',
    refreshing: false,
    loadingMore: false,
    error,
  };
}

/**
 * Appends a successfully loaded additional page onto the current state,
 * re-deriving `hasMore` with the short-page guard and clearing any prior
 * load-more error.
 */
export function appendPage(
  prev: ProductsState,
  response: ProductListResponse,
  nextPage: number,
): ProductsState {
  const products = [...prev.products, ...response.products];
  return {
    ...prev,
    products,
    page: nextPage,
    hasMore: deriveHasMore(response.products.length, products.length, response.total),
    loadingMore: false,
    loadMoreError: null,
  };
}

/**
 * Records a load-more failure without tearing down the visible list: the
 * footer spinner is replaced by a retry affordance driven by `loadMoreError`.
 */
export function resolveLoadMoreError(prev: ProductsState, error: Error): ProductsState {
  return {
    ...prev,
    loadingMore: false,
    loadMoreError: error,
  };
}

/**
 * Whether a `loadMore` should be allowed to start given the current state.
 * A pending load-more error does not block a retry.
 */
export function canLoadMore(state: ProductsState): boolean {
  return (
    state.status === 'success' &&
    state.hasMore &&
    !state.loadingMore &&
    !state.refreshing
  );
}
