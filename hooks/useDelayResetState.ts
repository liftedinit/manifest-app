import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

/**
 * Create a state that will reset after a delayed to its initial or previous value.
 * Can be updated to a new value without resetting.
 * @param initialState
 * @param delay
 * @returns [state, setState, updateState]
 */
export function useDelayResetState<T>(
  initialState: T,
  delay: number
): [T, Dispatch<SetStateAction<T>>, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState(initialState);
  const resetStateRef = useRef<T>(initialState);
  const timerRef = useRef<Timer | undefined>(undefined);

  const setDelayResetState = (value: SetStateAction<T>) => {
    if (typeof value === 'function') {
      value = (value as (prevState: T) => T)(state);
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setState(value);
    timerRef.current = setTimeout(() => {
      setState(resetStateRef.current);
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }, delay);
  };

  const updateBaseState = (value: SetStateAction<T>) => {
    if (typeof value === 'function') {
      value = (value as (prevState: T) => T)(state);
    }
    resetStateRef.current = value;
  };

  return [state, setDelayResetState, updateBaseState] as const;
}
