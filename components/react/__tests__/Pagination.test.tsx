import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, jest, test } from 'bun:test';

import { Navigator, Pagination, createArrayOfPageIndex } from '@/components/react/Pagination';
import { formatComponent } from '@/tests';

describe('createArrayOfPageIndex', () => {
  test('works for small current', () => {
    expect(createArrayOfPageIndex(5, 1)).toEqual([0, 1, 2, 3, 4]);
    expect(createArrayOfPageIndex(3, 2)).toEqual([0, 1, 2]);
    expect(createArrayOfPageIndex(3, 3)).toEqual([0, 1, 2]);
  });

  test('ellipsis works', () => {
    expect(createArrayOfPageIndex(10, 0)).toEqual([0, 1, 2, 3, 4, 5, '...', 9]);
    expect(createArrayOfPageIndex(10, 10)).toEqual([0, '...', 4, 5, 6, 7, 8, 9]);
    expect(createArrayOfPageIndex(20, 8)).toEqual([0, '...', 6, 7, 8, 9, 10, '...', 19]);
    expect(createArrayOfPageIndex(20, 9)).toEqual([0, '...', 7, 8, 9, 10, 11, '...', 19]);
  });
});

describe('Pagination', () => {
  afterEach(() => {
    cleanup();
  });

  test('works for small dataset', () => {
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
    fireEvent.click(screen.getByLabelText(/Previous page/i));
    expect(formatComponent(mockup.asFragment())).toMatchSnapshot('middle');
    fireEvent.click(screen.getByLabelText(/Previous page/i));
    expect(formatComponent(mockup.asFragment())).toMatchSnapshot('start');
  });

  test('does not show navigation if single page', () => {
    const mockup = render(
      <Pagination pageSize={5} dataset={[1, 2, 3]}>
        <Pagination.Data.Consumer>{d => JSON.stringify(d)}</Pagination.Data.Consumer>
      </Pagination>
    );
    expect(mockup.queryByLabelText(/pagination/i)).not.toBeInTheDocument();
  });
});

describe('Navigator', () => {
  afterEach(() => {
    cleanup();
  });

  test('works for single page', () => {
    const onChange = jest.fn();
    const mockup = render(<Navigator nbPages={1} page={0} onChange={onChange} />);

    expect(mockup.queryByLabelText(/pagination/i)).toBeInTheDocument();
    expect(mockup.queryByText('1')).toBeInTheDocument();
    expect(formatComponent(mockup.asFragment())).toMatchSnapshot();
  });

  test('works for lots of pages', () => {
    const onChange = jest.fn();
    const mockup = render(<Navigator nbPages={13} page={7} onChange={onChange} />);

    expect(mockup.queryByLabelText(/pagination/i)).toBeInTheDocument();
    expect(mockup.queryByLabelText('Page 1')).toBeInTheDocument();
    expect(mockup.queryByText('1')).toBeInTheDocument();
    expect(mockup.queryByText('2')).not.toBeInTheDocument();
    expect(mockup.queryByText('3')).not.toBeInTheDocument();
    expect(mockup.queryByText('4')).not.toBeInTheDocument();
    expect(mockup.queryByText('5')).not.toBeInTheDocument();
    expect(mockup.queryByLabelText('Page 6')).toBeInTheDocument();
    expect(mockup.queryByText('6')).toBeInTheDocument();
    expect(mockup.queryByText('7')).toBeInTheDocument();
    expect(mockup.queryByText('8')).toBeInTheDocument();
    expect(mockup.queryByText('9')).toBeInTheDocument();
    expect(mockup.queryByLabelText('Page 10')).toBeInTheDocument();
    expect(mockup.queryByText('10')).toBeInTheDocument();
    expect(mockup.queryByText('11')).not.toBeInTheDocument();
    expect(mockup.queryByText('12')).not.toBeInTheDocument();
    expect(mockup.queryByLabelText('Page 13')).toBeInTheDocument();
    expect(mockup.queryByText('13')).toBeInTheDocument();

    expect(formatComponent(mockup.asFragment())).toMatchSnapshot();
  });
});
