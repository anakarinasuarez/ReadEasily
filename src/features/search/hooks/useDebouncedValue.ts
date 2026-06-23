import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value` that only updates after `delayMs` of quiet
 * — used by the Search screen so live text filtering runs on a settled query,
 * not on every keystroke. The timer resets on each change and is cleared on
 * unmount, so a fast typist never triggers a burst of intermediate filters.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
