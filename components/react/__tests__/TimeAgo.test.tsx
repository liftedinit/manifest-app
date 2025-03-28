import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, jest, spyOn, test } from 'bun:test';

import { TimeAgo } from '@/components';
import { formatComponent } from '@/tests';

describe('TimeAgo', () => {
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  test('renders correctly in the past', () => {
    const now = new Date('2020-01-10 00:00:00 UTC');

    let mockup = render(
      <TimeAgo datetime={new Date('2020-01-09 00:00:00 UTC')} relativeDate={now} />
    );
    expect(formatComponent(mockup.asFragment())).toMatchSnapshot('1-day');
    expect(mockup.getByText(/1 day ago/i)).toBeInTheDocument();

    mockup = render(<TimeAgo datetime={new Date('2020-01-05 00:00:00 UTC')} relativeDate={now} />);
    expect(formatComponent(mockup.asFragment())).toMatchSnapshot('5-days');
    expect(mockup.getByText(/5 days ago/i)).toBeInTheDocument();

    mockup = render(<TimeAgo datetime={new Date('2020-01-01 00:00:00 UTC')} relativeDate={now} />);
    expect(formatComponent(mockup.asFragment())).toMatchSnapshot('1-week');
    expect(mockup.getByText(/1 week ago/i)).toBeInTheDocument();
  });

  test('renders correctly in the future', () => {
    const now = new Date('2020-01-01 00:00:00 UTC');

    let mockup = render(
      <TimeAgo datetime={new Date('2020-01-09 00:00:00 UTC')} relativeDate={now} />
    );
    expect(formatComponent(mockup.asFragment())).toMatchSnapshot('1-week');
    expect(mockup.getByText(/in 1 week/i)).toBeInTheDocument();

    mockup = render(<TimeAgo datetime={new Date('2020-01-05 00:00:00 UTC')} relativeDate={now} />);
    expect(formatComponent(mockup.asFragment())).toMatchSnapshot('4-days');
    expect(mockup.getByText(/in 4 days/i)).toBeInTheDocument();

    mockup = render(<TimeAgo datetime={new Date('2020-01-02 00:00:00 UTC')} relativeDate={now} />);
    expect(formatComponent(mockup.asFragment())).toMatchSnapshot('1-day');
    expect(mockup.getByText(/in 1 day/i)).toBeInTheDocument();

    mockup = render(<TimeAgo datetime={new Date('2020-01-01 00:00:00 UTC')} relativeDate={now} />);
    expect(formatComponent(mockup.asFragment())).toMatchSnapshot('just-now');
    expect(mockup.getByText(/just now/i)).toBeInTheDocument();
  });

  test('updates live', () => {
    jest.setSystemTime(new Date('2020-01-09 00:00:00 UTC'));
    const setInterval$ = spyOn(global, 'setInterval');

    const comp = <TimeAgo datetime={new Date('2020-01-10 00:00:00 UTC')} />;
    const mockup = render(comp);
    expect(mockup.getByText(/in 1 day/i)).toBeInTheDocument();

    expect(setInterval$).toHaveBeenCalledTimes(1);

    jest.setSystemTime(new Date('2020-01-09 23:00:00 UTC'));
    setInterval$.mock.calls.forEach(([callback]) => {
      callback();
    });

    mockup.rerender(comp);
    expect(mockup.getByText(/in 1 hour/i)).toBeInTheDocument();
  });
});
