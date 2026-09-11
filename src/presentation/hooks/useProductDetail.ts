import { useCallback, useEffect, useRef, useState } from 'react';

import { productRepository } from '../../data/productRepository';
import type { Product } from '../../domain/product';

/** The high-level status of the product detail fetch. */
export type ProductDetailStatus = 'loading' | 'error' | 'success';

/** The state exposed by {@link useProductDetail}. */
export interface ProductDetailState {
  status: ProductDetailStatus;
  product: Product | null;
  error: Error | null;
}

/** The state plus the retry action the UI can trigger. */
export interface UseProductDetailResult extends ProductDetailState {
  retry: () => void;
}

const INITIAL_STATE: ProductDetailState = {
  status: 'loading',
  product: null,
  error: null,
};

/**
 * Loads a single product by id via `productRepository.getProduct`, exposing a
 * simple loading / error / success state machine plus a `retry()` action for
 * error recovery. Reloads whenever `id` changes and guards against
 * out-of-order responses.
 */
export function useProductDetail(id: number): UseProductDetailResult {
  const [state, setState] = useState<ProductDetailState>(INITIAL_STATE);

  // Guards against out-of-order responses when the id changes mid-flight.
  const requestIdRef = useRef(0);

  const load = useCallback(async (productId: number) => {
    const requestId = ++requestIdRef.current;

    setState((prev) => ({ ...prev, status: 'loading', error: null }));

    try {
      const product = await productRepository.getProduct(productId);
      if (requestId !== requestIdRef.current) {
        return;
      }
      setState((prev) => ({ ...prev, status: 'success', product, error: null }));
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }
      setState((prev) => ({
        ...prev,
        status: 'error',
        product: null,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
    }
  }, []);

  useEffect(() => {
    load(id);
  }, [id, load]);

  const retry = useCallback(() => {
    load(id);
  }, [id, load]);

  return { ...state, retry };
}
