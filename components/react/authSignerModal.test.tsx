import { test, expect, afterEach, describe, mock, jest } from 'bun:test';
import { PromptSignModalInner, LedgerSignModalInner } from './authSignerModal';
import React from 'react';
import { fireEvent, screen, cleanup, render } from '@testing-library/react';
import { renderWithChainProvider } from '@/tests/render';

mock.module('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    query: {},
    push: jest.fn(),
  }),
}));

describe('PromptSignModalInner', () => {
  afterEach(() => {
    cleanup();
  });

  test('should render', () => {
    const wrapper = renderWithChainProvider(
      <PromptSignModalInner visible={true} onClose={() => {}} />
    );
    expect(screen.getByText('Approve')).toBeInTheDocument();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeVisible();
  });

  test('should not be visible initially when visible prop is false', () => {
    const wrapper = renderWithChainProvider(
      <PromptSignModalInner visible={false} onClose={() => {}} />
    );
    const dialog = screen.queryAllByRole('dialog');
    expect(dialog.length).toBe(0);
  });

  test('should close on clicking buttons', () => {
    let [isOpen, approved, rejected] = [true, false, false];

    const wrapper = renderWithChainProvider(
      <PromptSignModalInner
        visible={isOpen}
        onClose={() => {
          isOpen = false;
        }}
        approve={() => {
          approved = true;
        }}
        reject={() => {
          rejected = true;
        }}
      />
    );

    // Click reject.
    expect(isOpen).toBe(true);
    fireEvent.click(screen.getByText('Reject'));
    expect(isOpen).toBe(false);
    expect(approved).toBe(false);
    expect(rejected).toBe(true);

    // Click approve.
    isOpen = true;
    approved = false;
    rejected = false;
    fireEvent.click(screen.getByText('Approve'));
    expect(isOpen).toBe(false);
    expect(approved).toBe(true);
    expect(rejected).toBe(false);
  });

  test('should close on clicking the close button', () => {
    let [isOpen, approved, rejected] = [true, false, false];

    const wrapper = renderWithChainProvider(
      <PromptSignModalInner
        visible={isOpen}
        onClose={() => {
          isOpen = false;
        }}
        approve={() => {
          approved = true;
        }}
        reject={() => {
          rejected = true;
        }}
      />
    );

    expect(isOpen).toBe(true);
    fireEvent.click(screen.getByText('✕'));
    expect(isOpen).toBe(false);
    expect(approved).toBe(false);
    expect(rejected).toBe(false);
  });

  test('should close on pressing escape', () => {
    let [isOpen, approved, rejected] = [true, false, false];

    const wrapper = renderWithChainProvider(
      <PromptSignModalInner
        visible={isOpen}
        onClose={() => {
          isOpen = false;
        }}
        approve={() => {
          approved = true;
        }}
        reject={() => {
          rejected = true;
        }}
      />
    );

    expect(isOpen).toBe(true);
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(isOpen).toBe(false);
    expect(approved).toBe(false);
    expect(rejected).toBe(false);
  });
});

describe('LedgerSignModalInner', () => {
  afterEach(() => {
    cleanup();
  });

  test('should render', () => {
    const wrapper = render(<LedgerSignModalInner onClose={() => {}} />);
    expect(screen.getByText('Ledger HSM')).toBeInTheDocument();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeVisible();
  });

  test('should NOT close on pressing escape', () => {
    let isOpen = true;
    const wrapper = render(<LedgerSignModalInner onClose={() => (isOpen = false)} />);

    const dialog = screen.getByRole('dialog');

    expect(isOpen).toBe(true);
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    // onClose is called.
    expect(isOpen).toBe(false);

    // It does not cease to be visible.
    expect(dialog).toBeVisible();
  });
});
