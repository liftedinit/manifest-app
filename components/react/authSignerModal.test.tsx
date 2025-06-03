import { SignData } from '@cosmos-kit/web3auth';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import React from 'react';

import { LedgerSignModalInner, PromptSignModalInner } from '@/components';
import { clearAllMocks, formatComponent, mockRouter } from '@/tests';
import { renderWithChainProvider } from '@/tests/render';

// Mock SignData for testing fee extraction
const mockSignDataWithStdFee: SignData = {
  type: 'amino',
  value: {
    fee: {
      amount: [{ denom: 'umfx', amount: '123000' }],
      gas: '200000',
    },
    msgs: [],
    memo: '',
    chain_id: 'manifest-1',
    account_number: '0',
    sequence: '0',
  },
};

const mockSignDataWithMultipleFees: SignData = {
  type: 'amino',
  value: {
    fee: {
      amount: [
        { denom: 'umfx', amount: '123000' },
        { denom: 'uatom', amount: '456000' },
      ],
      gas: '300000',
    },
    msgs: [],
    memo: '',
    chain_id: 'manifest-1',
    account_number: '0',
    sequence: '0',
  },
};

const mockSignDataWithNoFeeAmount: SignData = {
  type: 'amino',
  value: {
    fee: {
      amount: [],
      gas: '150000',
    },
    msgs: [],
    memo: '',
    chain_id: 'manifest-1',
    account_number: '0',
    sequence: '0',
  },
};

const mockSignDataWithSignDoc: SignData = {
  type: 'direct',
  value: {
    bodyBytes: new Uint8Array(),
    authInfoBytes: new Uint8Array([
      10, 83, 10, 81, 10, 40, 47, 99, 111, 115, 109, 111, 115, 46, 99, 114, 121, 112, 116, 111, 46,
      115, 101, 99, 112, 50, 53, 54, 107, 49, 46, 80, 117, 98, 75, 101, 121, 18, 37, 10, 33, 3, 182,
      111, 159, 126, 218, 135, 87, 104, 213, 191, 156, 207, 126, 164, 78, 123, 29, 91, 122, 90, 39,
      172, 178, 239, 230, 244, 188, 26, 206, 47, 69, 134, 18, 4, 8, 127, 24, 1, 18, 19, 10, 13, 10,
      4, 117, 109, 102, 120, 18, 5, 49, 50, 51, 52, 53, 16, 128, 150, 12,
    ]),
    accountNumber: BigInt(0),
    chainId: 'manifest-1',
  },
};

describe('PromptSignModalInner', () => {
  beforeEach(() => {
    mockRouter();
  });

  afterEach(() => {
    cleanup();
    clearAllMocks();
  });

  test('should render with standard fee data', () => {
    const wrapper = renderWithChainProvider(
      <PromptSignModalInner visible={true} onClose={() => {}} data={mockSignDataWithStdFee} />
    );
    expect(screen.getByText('Approve')).toBeInTheDocument();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeVisible();
    expect(screen.getByText('Fee:')).toBeInTheDocument();
    expect(screen.getByText('0.123 MFX')).toBeInTheDocument();
    expect(formatComponent(wrapper.asFragment())).toMatchSnapshot();
  });

  test('should render with multiple fee currencies', () => {
    const wrapper = renderWithChainProvider(
      <PromptSignModalInner visible={true} onClose={() => {}} data={mockSignDataWithMultipleFees} />
    );
    expect(screen.getByText('Fee:')).toBeInTheDocument();
    expect(screen.getByText('0.123 MFX, 0.456 ATOM')).toBeInTheDocument();
    expect(formatComponent(wrapper.asFragment())).toMatchSnapshot();
  });

  test('should render with gas-only fee (no amount)', () => {
    const wrapper = renderWithChainProvider(
      <PromptSignModalInner visible={true} onClose={() => {}} data={mockSignDataWithNoFeeAmount} />
    );
    expect(screen.getByText('Fee:')).toBeInTheDocument();
    expect(screen.getByText('Gas: 150000')).toBeInTheDocument();
    expect(formatComponent(wrapper.asFragment())).toMatchSnapshot();
  });

  test('should render with SignDoc fee data', () => {
    const wrapper = renderWithChainProvider(
      <PromptSignModalInner visible={true} onClose={() => {}} data={mockSignDataWithSignDoc} />
    );
    expect(screen.getByText('Fee:')).toBeInTheDocument();
    // This should extract fee from authInfoBytes
    expect(formatComponent(wrapper.asFragment())).toMatchSnapshot();
  });

  test('should render with fallback when no fee data', () => {
    const wrapper = renderWithChainProvider(
      <PromptSignModalInner visible={true} onClose={() => {}} />
    );
    expect(screen.getByText('Approve')).toBeInTheDocument();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeVisible();
    expect(screen.getByText('Fee:')).toBeInTheDocument();
    expect(screen.getByText('Gas: 0')).toBeInTheDocument();
    expect(formatComponent(wrapper.asFragment())).toMatchSnapshot();
  });

  test('should display fee label and value on separate lines', () => {
    const wrapper = renderWithChainProvider(
      <PromptSignModalInner visible={true} onClose={() => {}} data={mockSignDataWithStdFee} />
    );

    // Check that fee label and value are in separate spans
    const feeLabel = screen.getByText('Fee:');
    const feeValue = screen.getByText('0.123 MFX');

    expect(feeLabel).toBeInTheDocument();
    expect(feeValue).toBeInTheDocument();

    // Check the layout structure
    const feeContainer = feeLabel.closest('.flex.flex-col');
    expect(feeContainer).toBeInTheDocument();
    expect(feeContainer).toHaveClass('items-start', 'justify-start');
  });

  test('should not be visible initially when visible prop is false', () => {
    const wrapper = renderWithChainProvider(
      <PromptSignModalInner visible={false} onClose={() => {}} />
    );
    const dialog = screen.queryAllByRole('dialog');
    expect(dialog.length).toBe(0);

    expect(formatComponent(wrapper.asFragment())).toMatchSnapshot();
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
