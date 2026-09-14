import { useEffect, useState } from 'react';

import { productRepository } from '../../data/productRepository';
import type { Category } from '../../domain/product';

/** Status of the categories fetch. */
export type CategoriesStatus = 'loading' | 'error' | 'success';

export interface UseCategoriesResult {
  status: CategoriesStatus;
  categories: Category[];
  error: Error | null;
  retry: () => void;
}

/**
 * Loads the full list of product categories once (via
 * `productRepository.getCategories`). The category carousel degrades
 * gracefully: on error it simply renders no chips beyond "All".
 */
export function useCategories(): UseCategoriesResult {
  const [state, setState] = useState<{
    status: CategoriesStatus;
    categories: Category[];
    error: Error | null;
  }>({ status: 'loading', categories: [], error: null });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    productRepository
      .getCategories()
      .then((result) => {
        if (cancelled) return;
        setState({ status: 'success', categories: result, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          status: 'error',
          categories: [],
          error: err instanceof Error ? err : new Error(String(err)),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const retry = () => {
    setState({ status: 'loading', categories: [], error: null });
    setReloadToken((t) => t + 1);
  };

  return { ...state, retry };
}
