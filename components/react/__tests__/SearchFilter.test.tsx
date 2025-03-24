import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, jest, test } from 'bun:test';

import { SearchFilter, SearchInput, SearchProvider } from '@/components/react/SearchFilter';
import { formatComponent } from '@/tests';

describe('SearchFilter', () => {
  afterEach(() => {
    cleanup();
  });

  test('works for simple dataset', () => {
    const mockup = render(
      <SearchProvider defaultValue="3">
        <SearchInput />
        <SearchFilter
          dataset={[1, 2, 3, 4, 5]}
          filterFn={(t, data) => {
            return data.filter(x => x > Number.parseInt(t));
          }}
        >
          <span data-testid="content">
            <SearchFilter.Data.Consumer>{JSON.stringify}</SearchFilter.Data.Consumer>
          </span>
        </SearchFilter>
      </SearchProvider>
    );

    expect(mockup.getByTestId('content')).toHaveTextContent('[4,5]');
    expect(formatComponent(mockup.asFragment())).toMatchSnapshot('before');

    // Update the value.
    fireEvent.change(mockup.getByTestId('search-input'), {
      target: { value: '2' },
    });

    expect(mockup.getByTestId('content')).toHaveTextContent('[3,4,5]');
    expect(formatComponent(mockup.asFragment())).toMatchSnapshot('after');
  });
});
