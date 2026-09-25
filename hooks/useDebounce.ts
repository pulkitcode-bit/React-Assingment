import { useEffect, useState } from 'react';

/**
 * Custom Hook: useDebounce
 * Delays updating the debounced value until after `delay` milliseconds have elapsed
 * since the last time `value` was modified.
 * 
 * Used for debouncing rapid search input typing (400-500ms) before triggering API calls.
 */
export function useDebounce<T>(value: T, delay: number = 450): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
