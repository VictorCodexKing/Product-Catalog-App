import { PAGE_SIZE, type Product, type ProductListResponse } from '../../../domain/product';
import {
  INITIAL_STATE,
  appendPage,
  canLoadMore,
  deriveHasMore,
  resolveFirstPage,
  resolveFirstPageError,
  resolveLoadMoreError,
  type ProductsState,
} from '../productsState';

function makeProduct(id: number): Product {
  return {
    id,
    title: `Product ${id}`,
    description: 'desc',
    price: 10,
    rating: 4,
    thumbnail: 'https://example.com/t.jpg',
    images: [],
  };
}

function makePage(count: number, total: number, skip = 0): ProductListResponse {
  const products = Array.from({ length: count }, (_, i) => makeProduct(skip + i + 1));
  return { products, total, skip, limit: PAGE_SIZE };
}

describe('deriveHasMore', () => {
  it('is true when a full page loads and the count still trails total', () => {
    expect(deriveHasMore(PAGE_SIZE, PAGE_SIZE, 100)).toBe(true);
  });

  it('is false once the accumulated count reaches total on a full page', () => {
    expect(deriveHasMore(PAGE_SIZE, 100, 100)).toBe(false);
  });

  it('treats a short page as end-of-list even if count trails total', () => {
    // Short page while total still says there is more: must terminate.
    expect(deriveHasMore(PAGE_SIZE - 1, 39, 100)).toBe(false);
  });

  it('treats an empty page as end-of-list', () => {
    expect(deriveHasMore(0, 40, 100)).toBe(false);
  });
});

describe('resolveFirstPage', () => {
  it('resolves a non-empty full page to success with hasMore true', () => {
    const state = resolveFirstPage(makePage(PAGE_SIZE, 100));
    expect(state.status).toBe('success');
    expect(state.products).toHaveLength(PAGE_SIZE);
    expect(state.page).toBe(0);
    expect(state.hasMore).toBe(true);
    expect(state.loadingMore).toBe(false);
    expect(state.error).toBeNull();
    expect(state.loadMoreError).toBeNull();
  });

  it('resolves an empty page to the empty state with hasMore false', () => {
    const state = resolveFirstPage(makePage(0, 0));
    expect(state.status).toBe('empty');
    expect(state.products).toHaveLength(0);
    expect(state.hasMore).toBe(false);
  });

  it('resolves a short non-empty page to success with hasMore false', () => {
    const state = resolveFirstPage(makePage(5, 100));
    expect(state.status).toBe('success');
    expect(state.hasMore).toBe(false);
  });

  it('resets to page 0, clearing prior products (query-change reset)', () => {
    // Simulate a previous query having appended a second page, then a fresh
    // first-page load for a new query.
    const state = resolveFirstPage(makePage(PAGE_SIZE, 100, 0));
    expect(state.page).toBe(0);
    expect(state.products.map((p) => p.id)).toEqual(
      Array.from({ length: PAGE_SIZE }, (_, i) => i + 1),
    );
  });
});

describe('resolveFirstPageError', () => {
  it('moves to the error status and records the error', () => {
    const err = new Error('network down');
    const state = resolveFirstPageError({ ...INITIAL_STATE, status: 'loading' }, err);
    expect(state.status).toBe('error');
    expect(state.error).toBe(err);
    expect(state.refreshing).toBe(false);
    expect(state.loadingMore).toBe(false);
  });
});

describe('appendPage', () => {
  const base: ProductsState = {
    ...resolveFirstPage(makePage(PAGE_SIZE, 100, 0)),
    loadingMore: true,
  };

  it('appends the next page and advances the page number', () => {
    const next = appendPage(base, makePage(PAGE_SIZE, 100, PAGE_SIZE), 1);
    expect(next.page).toBe(1);
    expect(next.products).toHaveLength(PAGE_SIZE * 2);
    expect(next.hasMore).toBe(true);
    expect(next.loadingMore).toBe(false);
    expect(next.loadMoreError).toBeNull();
  });

  it('terminates hasMore on a short appended page', () => {
    const next = appendPage(base, makePage(3, 100, PAGE_SIZE), 1);
    expect(next.hasMore).toBe(false);
    expect(next.products).toHaveLength(PAGE_SIZE + 3);
  });

  it('terminates hasMore on an empty appended page', () => {
    const next = appendPage(base, makePage(0, 100, PAGE_SIZE), 1);
    expect(next.hasMore).toBe(false);
    expect(next.products).toHaveLength(PAGE_SIZE);
  });

  it('clears a prior load-more error on a successful append', () => {
    const errored = resolveLoadMoreError(base, new Error('boom'));
    const next = appendPage(errored, makePage(PAGE_SIZE, 100, PAGE_SIZE), 1);
    expect(next.loadMoreError).toBeNull();
  });
});

describe('resolveLoadMoreError', () => {
  it('records the load-more error without tearing down the list', () => {
    const base = resolveFirstPage(makePage(PAGE_SIZE, 100));
    const err = new Error('page fetch failed');
    const state = resolveLoadMoreError({ ...base, loadingMore: true }, err);
    expect(state.status).toBe('success');
    expect(state.products).toHaveLength(PAGE_SIZE);
    expect(state.loadingMore).toBe(false);
    expect(state.loadMoreError).toBe(err);
    expect(state.hasMore).toBe(true); // still recoverable
  });
});

describe('canLoadMore', () => {
  const success = resolveFirstPage(makePage(PAGE_SIZE, 100));

  it('allows loading more from a success state with more pages', () => {
    expect(canLoadMore(success)).toBe(true);
  });

  it('blocks when there are no more pages', () => {
    expect(canLoadMore({ ...success, hasMore: false })).toBe(false);
  });

  it('blocks while already loading more', () => {
    expect(canLoadMore({ ...success, loadingMore: true })).toBe(false);
  });

  it('blocks while refreshing', () => {
    expect(canLoadMore({ ...success, refreshing: true })).toBe(false);
  });

  it('blocks when not in the success status', () => {
    expect(canLoadMore({ ...success, status: 'loading' })).toBe(false);
    expect(canLoadMore({ ...success, status: 'error' })).toBe(false);
    expect(canLoadMore({ ...success, status: 'empty' })).toBe(false);
  });
});
