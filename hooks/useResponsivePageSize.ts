import { useEffect, useMemo, useState } from 'react';

import { debounce } from '@/helpers';

interface PageSizeConfig {
  [key: string]: number;
}

const getWindowDimensions = () => ({
  height: typeof window !== 'undefined' ? window.innerHeight : Infinity,
  width: typeof window !== 'undefined' ? window.innerWidth : Infinity,
});

const findMatchingConfig = <T extends PageSizeConfig>(
  dimensions: { height: number; width: number },
  sizeLookup: Array<{ height: number; width: number; sizes: T }>,
  defaultSizes: T
): T => {
  const config = sizeLookup.find(
    breakpoint =>
      dimensions.height < breakpoint.height &&
      (dimensions.width < breakpoint.width || breakpoint.width === Infinity)
  );
  return config?.sizes || defaultSizes;
};

function isDifferent<T extends PageSizeConfig>(a: T, b: T): boolean {
  return Object.keys(a).some(key => a[key] !== b[key]);
}

export function useResponsivePageSize<T extends PageSizeConfig>(
  sizeLookup: Array<{ height: number; width: number; sizes: T }>,
  defaultSizes: T
) {
  const [pageSize, setPageSize] = useState<T>(() =>
    findMatchingConfig(getWindowDimensions(), sizeLookup, defaultSizes)
  );

  const debouncedResizeHandler = useMemo(
    () =>
      debounce(() => {
        const newPageSize = findMatchingConfig(getWindowDimensions(), sizeLookup, defaultSizes);
        if (isDifferent(pageSize, newPageSize)) {
          setPageSize(newPageSize);
        }
      }, 150),
    [sizeLookup, defaultSizes, pageSize]
  );

  useEffect(() => {
    debouncedResizeHandler();
    window.addEventListener('resize', debouncedResizeHandler);
    return () => window.removeEventListener('resize', debouncedResizeHandler);
  }, [debouncedResizeHandler]);

  return pageSize;
}
