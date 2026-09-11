/**
 * A debounced version of a function: it delays invoking `fn` until `delayMs`
 * have elapsed since the last time the debounced function was called. Only the
 * most recent call's arguments are used.
 */
export interface DebouncedFunction<Args extends unknown[]> {
  (...args: Args): void;
  /** Cancels any pending invocation. */
  cancel: () => void;
}

/**
 * Creates a debounced wrapper around `fn`.
 *
 * @param fn      The function to debounce.
 * @param delayMs The quiet period, in milliseconds, before `fn` is invoked.
 * @returns A debounced function exposing a `cancel()` method.
 */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number,
): DebouncedFunction<Args> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: Args): void => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = undefined;
      fn(...args);
    }, delayMs);
  };

  debounced.cancel = (): void => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };

  return debounced;
}
