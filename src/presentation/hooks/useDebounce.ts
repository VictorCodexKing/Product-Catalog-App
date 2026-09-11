import { useEffect, useState } from 'react';

/**
 * Returns a debounced copy of `value` that only updates after `delayMs` have
 * elapsed without further changes. Useful for throttling search input before
 * it triggers a network request.
 *
 * @param value   The value to debounce.
 * @param delayMs The quiet period, in milliseconds, before the debounced value
 *                catches up. Defaults to 400ms.
 */
export function useDebounce<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debounced;
}
