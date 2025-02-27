import { Dispatch, SetStateAction, useState } from 'react';

/**
 * A hook to use local storage with a key and initial value. This hook is server-side safe.
 * @param key The key to use for the local storage.
 * @param initialValue The initial value to use if the key is not set.
 * @param from A function to convert the stored string to the value.
 * @param to A function to convert the value to a string for storage.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  [from, to]: [(store: string) => T, (value: T) => string] = [JSON.parse, JSON.stringify]
): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        return item ? from(item) : initialValue;
      }
    } catch (_) {}
    return initialValue;
  });

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    window.localStorage.setItem(key, to(valueToStore));
    setStoredValue(valueToStore);
  };

  return [storedValue, setValue];
}
