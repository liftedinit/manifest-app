import React, { createContext } from 'react';

export interface PaginationProps<T> {
  pageSize: number;
  defaultPage?: number;
  selectedPage?: number;
  dataset: T[];

  onChange?: (data: T[], page: number) => void;
  children?: React.ReactNode | ((data: T[], page: number) => React.ReactNode);
}

/**
 * Creates an array of page indices based on the total number of items, page
 * size, current page, and maximum number of visible pages. The array may
 * include the string '...' to represent skipped page ranges.
 *
 * @param total - The total number of items across all pages.
 * @param pageSize - The number of items per page.
 * @param [current=0] - The current page index (zero-based). Default is 0.
 * @param [max=8] - The maximum number of visible page indices. Default is 8.
 * @return An array of page indices (zero-based) and/or '...' to represent
 *         skipped pages.
 */
export function createArrayOfPageIndex(
  total: number,
  pageSize: number,
  current = 0,
  max = 8
): (number | '...')[] {
  if (max <= 4) {
    throw new Error('max cannot be less than 5');
  }
  const nbPages = Math.ceil(total / pageSize);
  current = Math.max(Math.min(nbPages - 1, current), 0);

  const toShow = Math.min(nbPages, max);
  if (nbPages <= max) {
    return [...Array(nbPages).keys()];
  } else if (current <= toShow / 2) {
    return [...Array(toShow - 2).keys(), '...', nbPages - 1];
  } else if (current >= nbPages - 1 - toShow / 2) {
    return [
      0,
      '...',
      ...Array(toShow - 2)
        .keys()
        .map(x => x + nbPages - toShow / 2 - 2), // -2 to account for 0, and last.
    ];
  } else {
    let start = current - Math.floor(toShow / 2 - 1) + 1;
    let end = current + toShow / 2 - 1;
    return [
      0,
      '...',
      ...Array(end - start)
        .keys()
        .map(x => x + start),
      '...',
      nbPages - 1,
    ];
  }
}

export function Pagination<T>({
  pageSize,
  defaultPage = 0,
  selectedPage,
  dataset,
  onChange,
  children,
}: PaginationProps<T>) {
  const [pageInner, setPageInner] = React.useState(defaultPage);
  const pages = createArrayOfPageIndex(dataset.length, pageSize, pageInner);
  const nbPages: number = Math.ceil(dataset.length / pageSize);

  React.useEffect(() => {
    if (selectedPage !== undefined) {
      setPageInner(selectedPage);
    }
  }, [selectedPage]);

  function callOnChange() {
    onChange?.(dataset.slice(pageInner * pageSize, (pageInner + 1) * pageSize), pageInner);
  }

  function previous() {
    setPageInner(page => Math.max(0, page - 1));
    callOnChange();
  }

  function next() {
    setPageInner(page => Math.min(nbPages - 1, page + 1));
    callOnChange();
  }

  function setPage(page: number) {
    setPageInner(page);
    callOnChange();
  }

  const data = dataset.slice(pageInner * pageSize, (pageInner + 1) * pageSize);

  return (
    <>
      {children instanceof Function ? (
        children(data, pageInner)
      ) : (
        <Pagination.Index.Provider value={pageInner}>
          <Pagination.Data.Provider value={data}>{children}</Pagination.Data.Provider>
        </Pagination.Index.Provider>
      )}

      <div className="flex items-center justify-end gap-2 mt-4">
        <button
          onClick={previous}
          disabled={pageInner == 0}
          aria-label="Previous page"
          className="p-2 hover:bg-[#0000001A] dark:hover:bg-[#FFFFFF1A] text-black dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ‹
        </button>

        {pages.map((p, i) => {
          if (p === '...') {
            return (
              <span key={`ellipsis-${i}`} className="text-black dark:text-white">
                ...
              </span>
            );
          } else if (p === pageInner) {
            return (
              <button
                key={`page-${p}`}
                aria-label={`Page ${p}`}
                aria-current="page"
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors bg-[#0000001A] dark:bg-[#FFFFFF1A] text-black dark:text-white"
              >
                {p + 1}
              </button>
            );
          } else {
            return (
              <button
                key={`page-${p}`}
                onClick={() => setPage(p)}
                aria-label={`Page ${p}`}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[#0000001A] dark:hover:bg-[#FFFFFF1A] text-black dark:text-white"
              >
                {p + 1}
              </button>
            );
          }
        })}

        <button
          onClick={next}
          disabled={pageInner === nbPages - 1}
          aria-label="Next page"
          className="p-2 hover:bg-[#0000001A] dark:hover:bg-[#FFFFFF1A] text-black dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>
    </>
  );
}

Pagination.Index = createContext<number>(-1);
// Unfortunately, we cannot set the type of the context for Data to T, as T is
// unknown here.
Pagination.Data = createContext<any[]>([]);
