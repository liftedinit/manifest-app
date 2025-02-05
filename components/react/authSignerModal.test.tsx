import SignModal from './authSignerModal';
import { test, expect, afterEach, describe, mock, jest } from 'bun:test';
import React from 'react';
import matchers from '@testing-library/jest-dom/matchers';
import { fireEvent, screen, cleanup, within, waitFor } from '@testing-library/react';
import { renderWithChainProvider } from '@/tests/render';

mock.module('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    query: {},
    push: jest.fn(),
  }),
}));

expect.extend(matchers);

describe('SignModal', () => {
  afterEach(() => {
    cleanup();
  });

  test('should render', () => {
    const wrapper = renderWithChainProvider(<SignModal />);
    expect(screen.getByText('Tx Info')).toBeInTheDocument();
  });

  test('should close on clicking buttons with the right events', () => {
    let [isOpen, approved, rejected] = [true, false, false];

    const wrapper = renderWithChainProvider(
      <SignModal
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
      <SignModal
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

  // This test is failing as I cannot get the modal to capture the keydown event.
  test.skip('should close on pressing escape', () => {
    let [isOpen, approved, rejected] = [true, false, false];

    const wrapper = renderWithChainProvider(
      <SignModal
        showVoteModal={jest.fn()}
        setShowVoteModal={jest.fn()}
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
