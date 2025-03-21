import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'bun:test';
import { useContext } from 'react';

import { Pagination, createArrayOfPageIndex } from '@/components/react/Pagination';
import { formatComponent } from '@/tests';

describe('createArrayOfPageIndex', () => {
  test('works for small current', () => {
    expect(createArrayOfPageIndex(10, 2)).toEqual([0, 1, 2, 3, 4]);
    expect(createArrayOfPageIndex(10, 4)).toEqual([0, 1, 2]);
  });

  test('ellipsis works', () => {
    expect(createArrayOfPageIndex(20, 2, 0)).toEqual([0, 1, 2, 3, 4, 5, '...', 9]);
    expect(createArrayOfPageIndex(20, 2, 10)).toEqual([0, '...', 4, 5, 6, 7, 8, 9]);
    expect(createArrayOfPageIndex(40, 2, 8)).toEqual([0, '...', 6, 7, 8, 9, 10, '...', 19]);
    expect(createArrayOfPageIndex(40, 2, 9)).toEqual([0, '...', 7, 8, 9, 10, 11, '...', 19]);
  });
});

describe('Pagination', () => {
  test('works for small dataset', () => {
    function PageContent() {
      const i = useContext(Pagination.Index);
      const d = useContext(Pagination.Data);
      return (
        <>
          {i} {d.join()}
        </>
      );
    }

    const mockup = render(
      <Pagination pageSize={5} dataset={['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k']}>
        <Pagination.Index.Consumer>{i => i}</Pagination.Index.Consumer>
        <Pagination.Data.Consumer>{d => JSON.stringify(d)}</Pagination.Data.Consumer>
      </Pagination>
    );

    expect(formatComponent(mockup.asFragment())).toMatchSnapshot('start');
    fireEvent.click(screen.getByLabelText(/Next page/i));
    expect(formatComponent(mockup.asFragment())).toMatchSnapshot('middle');
    fireEvent.click(screen.getByLabelText(/Next page/i));
    expect(formatComponent(mockup.asFragment())).toMatchSnapshot('end');
  });
});
