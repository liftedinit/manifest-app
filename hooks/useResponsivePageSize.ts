import { debounce } from '@/helpers';
import { useState, useCallback, useEffect } from 'react';

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

export function useResponsivePageSize<T extends PageSizeConfig>(
  sizeLookup: Array<{ height: number; width: number; sizes: T }>,
  defaultSizes: T
) {
  const [pageSize, setPageSize] = useState<T>(() =>
    findMatchingConfig(getWindowDimensions(), sizeLookup, defaultSizes)
  );

  const updatePageSizes = useCallback(() => {
    return debounce(() => {
      setPageSize(findMatchingConfig(getWindowDimensions(), sizeLookup, defaultSizes));
    }, 150);
  }, [sizeLookup, defaultSizes]);

  useEffect(() => {
    const handleResize = updatePageSizes();
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updatePageSizes]);

  return pageSize;
}
