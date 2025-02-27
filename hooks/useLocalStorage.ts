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
  initialValue: T | (() => T),
  [from, to]: [(store: string) => T, (value: T) => string] = [JSON.parse, JSON.stringify]
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const ls = typeof localStorage !== 'undefined' ? localStorage : undefined;
  let initialValueFn = () => (initialValue instanceof Function ? initialValue() : initialValue);

  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = ls?.getItem(key);
    if (item) {
      return from(item);
    }

    return initialValueFn();
  });

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    ls?.setItem(key, to(valueToStore));
    setStoredValue(valueToStore);
  };

  const clearValue = () => {
    ls?.removeItem(key);
    setStoredValue(initialValueFn());
  };

  return [storedValue, setValue, clearValue];
}
