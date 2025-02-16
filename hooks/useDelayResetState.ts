import { Dispatch, SetStateAction, useCallback, useState } from 'react';

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
  const [resetState, setResetState] = useState(initialState);
  const [state, setState] = useState(initialState);

  const setDelayResetState = useCallback(
    (value: SetStateAction<T>) => {
      if (typeof value === 'function') {
        value = (value as (prevState: T) => T)(state);
      }

      setState(value);
      const timer = setTimeout(() => setState(resetState), delay);
      return () => clearTimeout(timer);
    },
    [state, delay, resetState]
  );

  const updateState = (value: SetStateAction<T>) => {
    setResetState(value);
  };

  return [state, setDelayResetState, updateState] as const;
}
