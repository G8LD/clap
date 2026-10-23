import * as React from "react";

/**
 * State hook backed by localStorage.
 *
 * SSR-safe: the server and the first client render both use `initialValue`
 * (so markup matches and there's no hydration mismatch); the stored value is
 * loaded in an effect right after mount. Subsequent updates are written back
 * to localStorage.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState<T>(initialValue);

  // Load persisted value once on mount.
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      // Ignore malformed/unavailable storage.
    }
  }, [key]);

  // Persist on change.
  React.useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota/availability errors.
    }
  }, [key, value]);

  return [value, setValue];
}
