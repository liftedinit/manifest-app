import { debounce } from '@/helpers';
import { useState, useCallback, useEffect } from 'react';

interface PageSizeConfig {
  [key: string]: number;
}

export function useResponsivePageSize<T extends PageSizeConfig>(
  sizeLookup: Array<{ height: number; width: number; sizes: T }>,
  defaultSizes: T
) {
  const [pageSize, setPageSize] = useState<T>(defaultSizes);

  const updatePageSizes = useCallback(() => {
    return debounce(() => {
      const height = window.innerHeight;
      const width = window.innerWidth;

      const config = sizeLookup.find(
        entry => height < entry.height && (width < entry.width || entry.width === Infinity)
      );

      setPageSize(config?.sizes || defaultSizes);
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
