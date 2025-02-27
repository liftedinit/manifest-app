import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test';

import { useLocalStorage } from '@/hooks';

class LocalStorageMock implements Storage {
  constructor(private store: Record<string, string> = {}) {}

  // To be compatible with Storage.
  length = 0;
  key = (n: number) => null;
  clear = () => {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

describe('useLocalStorage', () => {
  let previousLocalStorage: Storage;
  let storageMock: LocalStorageMock;

  beforeEach(() => {
    storageMock = new LocalStorageMock();
    previousLocalStorage = global.localStorage;
    Object.defineProperty(global, 'localStorage', {
      value: storageMock,
    });
  });

  afterEach(() => {
    Object.defineProperty(global, 'localStorage', {
      value: previousLocalStorage,
    });
    cleanup();
  });

  test('should store and retrieve values', async () => {
    function LocalStorageComponent() {
      let [value, setValue, resetValue] = useLocalStorage('test', 'initial');
      return (
        <div>
          <input data-testid="input" value={value} onChange={e => setValue(e.target.value)} />
          <button data-testid="reset-btn" onClick={resetValue}>
            Reset
          </button>
        </div>
      );
    }

    const mockup = render(<LocalStorageComponent />);
    const input = mockup.getByTestId('input') as HTMLInputElement;
    const resetBtn = mockup.getByTestId('reset-btn') as HTMLButtonElement;

    expect(input.value).toBe('initial');
    // Should not set the value
    expect(storageMock.getItem('test')).toBeNull();

    fireEvent.change(input, { target: { value: 'new value' } });
    await waitFor(() => {
      expect(storageMock.getItem('test')).toBe('"new value"');
    });

    fireEvent.click(resetBtn);
    await waitFor(() => {
      expect(storageMock.getItem('test')).toBeNull();
      expect(input.value).toBe('initial');
    });
  });

  test('should only call initial factory when empty', async () => {
    let initialFactory = jest.fn(() => 'initial');
    function LocalStorageComponent() {
      let [value, setValue, resetValue] = useLocalStorage('test', initialFactory);
      return (
        <div>
          <input data-testid="input" value={value} onChange={e => setValue(e.target.value)} />
          <button data-testid="reset-btn" onClick={resetValue}>
            Reset
          </button>
        </div>
      );
    }

    const mockup = render(<LocalStorageComponent />);
    const input = mockup.getByTestId('input') as HTMLInputElement;

    expect(input.value).toBe('initial');
    // Should not set the value
    expect(storageMock.getItem('test')).toBeNull();
    expect(initialFactory).toHaveBeenCalledTimes(1);

    initialFactory.mockClear();
    cleanup();

    // Loads from storage.
    storageMock.setItem('test', '"new value"');
    const mockup2 = render(<LocalStorageComponent />);
    const input2 = mockup2.getByTestId('input') as HTMLInputElement;
    expect(input2.value).toBe('new value');
    expect(initialFactory).not.toHaveBeenCalled();

    const resetBtn = mockup2.getByTestId('reset-btn') as HTMLButtonElement;
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(storageMock.getItem('test')).toBeNull();
      expect(input2.value).toBe('initial');
      expect(initialFactory).toHaveBeenCalledTimes(1);
    });
  });
});
