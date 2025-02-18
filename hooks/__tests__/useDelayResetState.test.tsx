import { test, expect, beforeEach, afterEach, describe } from 'bun:test';
import { install } from '@sinonjs/fake-timers';
import { useDelayResetState } from '@/hooks/useDelayResetState';
import { cleanup, render } from '@testing-library/react';

function TestComponent() {
  const [value, setValue, update] = useDelayResetState(0, 1000);

  return (
    <div>
      <div data-testid="value">{value}</div>
      <button data-testid="button" onClick={() => setValue(previous => previous + 1)}>
        Click Me
      </button>
      <button data-testid="update" onClick={() => update(100)}>
        Click Me To Update
      </button>
    </div>
  );
}

describe('useDelayResetState', () => {
  let clock: ReturnType<typeof install>;
  beforeEach(() => {
    clock = install();
  });
  afterEach(() => {
    clock.uninstall();
    cleanup();
  });

  test('works', () => {
    const wrapper = render(<TestComponent />);

    expect(wrapper.getByTestId('value').textContent).toBe('0');
    wrapper.getByTestId('button').click();

    wrapper.rerender(<TestComponent />);
    expect(wrapper.getByTestId('value')).toHaveTextContent('1');

    clock.tick(999);
    wrapper.rerender(<TestComponent />);
    expect(wrapper.getByTestId('value')).toHaveTextContent('1');

    clock.tick(1);
    wrapper.rerender(<TestComponent />);
    expect(wrapper.getByTestId('value')).toHaveTextContent('0');
  });

  test('allows updating the reset state', () => {
    const wrapper = render(<TestComponent />);

    expect(wrapper.getByTestId('value').textContent).toBe('0');
    wrapper.getByTestId('button').click();

    wrapper.rerender(<TestComponent />);
    expect(wrapper.getByTestId('value')).toHaveTextContent('1');

    clock.tick(999);
    wrapper.getByTestId('update').click();
    wrapper.rerender(<TestComponent />);
    expect(wrapper.getByTestId('value')).toHaveTextContent('1');

    clock.tick(1);
    wrapper.rerender(<TestComponent />);
    expect(wrapper.getByTestId('value')).toHaveTextContent('100');
  });

  test('reset the previous timer when re-updating in the middle of the delay', () => {
    const wrapper = render(<TestComponent />);

    expect(wrapper.getByTestId('value').textContent).toBe('0');
    wrapper.getByTestId('button').click();

    wrapper.rerender(<TestComponent />);
    expect(wrapper.getByTestId('value')).toHaveTextContent('1');

    clock.tick(999);
    wrapper.rerender(<TestComponent />);
    expect(wrapper.getByTestId('value')).toHaveTextContent('1');

    wrapper.getByTestId('button').click();
    wrapper.rerender(<TestComponent />);
    expect(wrapper.getByTestId('value')).toHaveTextContent('2');

    clock.tick(999);
    wrapper.rerender(<TestComponent />);
    expect(wrapper.getByTestId('value')).toHaveTextContent('2');

    clock.tick(1);
    wrapper.rerender(<TestComponent />);
    expect(wrapper.getByTestId('value')).toHaveTextContent('0');
  });
});
