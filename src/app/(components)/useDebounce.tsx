import * as React from "react";

/**
 * Returns a debounced copy of `value` that only updates after `delay`
 * milliseconds have passed without `value` changing.
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}
