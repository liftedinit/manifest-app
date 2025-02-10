import { Dispatch, SetStateAction, useState } from 'react';

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
