import { DependencyList, useEffect } from 'react';

/**
 * Create a debounce effect that will call the callback function after the delay has passed,
 * on an interval.
 * @param callback The function to call
 * @param delay The delay in milliseconds
 * @param dependencies The dependencies to watch for changes
 */
export const useIntervalDebounceEffect = (
  callback: () => Promise<void>,
  delay: number,
  dependencies?: DependencyList
) => {
  useEffect(() => {
    let done = false;
    let latestTimer: Timer | undefined;

    async function inner() {
      if (done) return;
      console.log(2);

      try {
        await callback();
      } catch (error) {
        console.error('Error during refetch:', error);
      } finally {
        if (!done) {
          latestTimer = setTimeout(inner, delay);
        }
      }
    }

    console.log(3, delay);
    latestTimer = setTimeout(inner, delay);

    return () => {
      console.log(4);
      done = true;
      clearTimeout(latestTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};
