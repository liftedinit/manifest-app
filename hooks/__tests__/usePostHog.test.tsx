import { cleanup, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test';
import React from 'react';

import { clearAllMocks, mockModule, mockRouter } from '@/tests';
import { renderWithChainProvider } from '@/tests/render';

import { useManifestPostHog } from '../usePostHog';

// Mock the config/env module
const mockEnv = {
  chain: 'manifesttestnet',
  chainId: 'manifest-ledger-testnet',
};

function TestComponent({ mockReturnValues }: { mockReturnValues?: any[] }) {
  const { posthog, trackTransaction, isReady } = useManifestPostHog();

  return (
    <div>
      <div data-testid="is-ready">{isReady ? 'ready' : 'not ready'}</div>
      <button
        data-testid="track-success"
        onClick={() =>
          trackTransaction({
            success: true,
            transactionHash: 'test-hash',
            chainId: 'manifest-ledger-testnet',
            messageTypes: ['/cosmos.bank.v1beta1.MsgSend'],
            fee: { amount: '1000', denom: 'umfx' },
            memo: 'test memo',
            gasUsed: '100000',
            gasWanted: '110000',
            height: '12345',
          })
        }
      >
        Track Success
      </button>
      <button
        data-testid="track-failure"
        onClick={() =>
          trackTransaction({
            success: false,
            transactionHash: 'test-hash-fail',
            chainId: 'manifest-ledger-testnet',
            messageTypes: ['/cosmos.bank.v1beta1.MsgSend'],
            error: 'Transaction failed',
          })
        }
      >
        Track Failure
      </button>
      <div data-testid="posthog-available">{posthog ? 'available' : 'not available'}</div>
    </div>
  );
}

describe('useManifestPostHog', () => {
  let mockPostHog: any;
  let mockWallet: any;

  beforeEach(() => {
    // Mock Next.js router
    mockRouter();

    // Mock the env config
    mockModule('@/config/env', () => mockEnv);

    // Create mock PostHog
    mockPostHog = {
      identify: jest.fn(),
      capture: jest.fn(),
      reset: jest.fn(),
      setPersonProperties: jest.fn(),
    };

    // Create mock wallet
    mockWallet = {
      prettyName: 'Test Wallet',
      mode: 'extension',
    };

    // Mock PostHog hook
    mockModule('posthog-js/react', () => ({
      usePostHog: jest.fn().mockReturnValue(mockPostHog),
    }));

    // Mock cosmos-kit useChain
    mockModule('@cosmos-kit/react', () => ({
      useChain: jest.fn().mockReturnValue({
        address: 'manifest1test',
        wallet: mockWallet,
        isWalletConnected: true,
      }),
    }));
  });

  afterEach(() => {
    cleanup();
    clearAllMocks();
    jest.clearAllMocks();
  });

  test('identifies user when wallet connects', async () => {
    const wrapper = renderWithChainProvider(<TestComponent />);

    await waitFor(() => {
      expect(wrapper.getByTestId('is-ready')).toHaveTextContent('ready');
    });

    expect(mockPostHog.identify).toHaveBeenCalledWith('manifest1test', {
      wallet_address: 'manifest1test',
      wallet_name: 'Test Wallet',
      wallet_mode: 'extension',
      chain_id: 'manifest-ledger-testnet',
      chain_name: 'manifesttestnet',
      last_connected: expect.any(String),
    });

    expect(mockPostHog.capture).toHaveBeenCalledWith('wallet_connected', {
      wallet_address: 'manifest1test',
      wallet_name: 'Test Wallet',
      wallet_mode: 'extension',
      chain_id: 'manifest-ledger-testnet',
      chain_name: 'manifesttestnet',
    });
  });

  test('re-identifies when wallet changes', async () => {
    // Mock a sequence where wallet changes from one to another
    const mockUseChain = jest.fn();
    const firstWallet = {
      prettyName: 'First Wallet',
      mode: 'extension',
    };
    const secondWallet = {
      prettyName: 'Second Wallet',
      mode: 'mobile',
    };

    // Sequence: connected with first wallet -> connected with second wallet
    mockUseChain
      .mockReturnValueOnce({
        address: 'manifest1test',
        wallet: firstWallet,
        isWalletConnected: true,
      })
      .mockReturnValue({
        address: 'manifest1test',
        wallet: secondWallet,
        isWalletConnected: true,
      });

    mockModule(
      '@cosmos-kit/react',
      () => ({
        useChain: mockUseChain,
      }),
      true
    );

    const { rerender } = renderWithChainProvider(<TestComponent />);

    // First render - connected with first wallet
    await waitFor(() => {
      expect(mockPostHog.identify).toHaveBeenCalledWith('manifest1test', {
        wallet_address: 'manifest1test',
        wallet_name: 'First Wallet',
        wallet_mode: 'extension',
        chain_id: 'manifest-ledger-testnet',
        chain_name: 'manifesttestnet',
        last_connected: expect.any(String),
      });
    });

    // Clear mocks to test wallet change re-identification
    mockPostHog.identify.mockClear();
    mockPostHog.capture.mockClear();

    // Second render - wallet changed (should trigger re-identification)
    rerender(<TestComponent />);

    await waitFor(() => {
      expect(mockPostHog.identify).toHaveBeenCalledWith('manifest1test', {
        wallet_address: 'manifest1test',
        wallet_name: 'Second Wallet',
        wallet_mode: 'mobile',
        chain_id: 'manifest-ledger-testnet',
        chain_name: 'manifesttestnet',
        last_connected: expect.any(String),
      });
      expect(mockPostHog.capture).toHaveBeenCalledWith(
        'wallet_connected',
        expect.objectContaining({
          wallet_name: 'Second Wallet',
          wallet_mode: 'mobile',
        })
      );
    });
  });

  test('handles wallet disconnection', async () => {
    // Create a controllable test component that can simulate disconnection
    let mockChainData = {
      address: 'manifest1test' as string | null,
      wallet: mockWallet as any,
      isWalletConnected: true,
    };

    const ControllableDisconnectionTestComponent = () => {
      const [, forceUpdate] = React.useState({});
      React.useEffect(() => {
        // Store the force update function globally so we can trigger it
        (window as any).forceDisconnectionUpdate = () => forceUpdate({});
      }, []);

      // Mock useChain to return our controllable data
      mockModule(
        '@cosmos-kit/react',
        () => ({
          useChain: jest.fn().mockReturnValue(mockChainData),
        }),
        true
      );

      const { posthog, isReady } = useManifestPostHog();
      return (
        <div>
          <div data-testid="is-ready">{isReady ? 'ready' : 'not ready'}</div>
          <div data-testid="posthog-available">{posthog ? 'available' : 'not available'}</div>
        </div>
      );
    };

    renderWithChainProvider(<ControllableDisconnectionTestComponent />);

    // Wait for initial connection
    await waitFor(() => {
      expect(mockPostHog.identify).toHaveBeenCalled();
    });

    // Clear mocks to test disconnection behavior
    mockPostHog.capture.mockClear();
    mockPostHog.reset.mockClear();

    // Simulate wallet disconnection
    mockChainData = {
      address: null,
      wallet: null,
      isWalletConnected: false,
    };
    (window as any).forceDisconnectionUpdate();

    await waitFor(() => {
      expect(mockPostHog.capture).toHaveBeenCalledWith('wallet_disconnected', {
        chain_id: 'manifest-ledger-testnet',
        chain_name: 'manifesttestnet',
        previous_address: 'manifest1test',
      });
      expect(mockPostHog.reset).toHaveBeenCalled();
    });
  });

  test('tracks successful transaction', async () => {
    const wrapper = renderWithChainProvider(<TestComponent />);

    await waitFor(() => {
      expect(wrapper.getByTestId('is-ready')).toHaveTextContent('ready');
    });

    wrapper.getByTestId('track-success').click();

    expect(mockPostHog.capture).toHaveBeenCalledWith('transaction_success', {
      success: true,
      transactionHash: 'test-hash',
      chainId: 'manifest-ledger-testnet',
      messageTypes: ['/cosmos.bank.v1beta1.MsgSend'],
      fee: { amount: '1000', denom: 'umfx' },
      memo: 'test memo',
      gasUsed: '100000',
      gasWanted: '110000',
      height: '12345',
      wallet_address: 'manifest1test',
      wallet_name: 'Test Wallet',
      timestamp: expect.any(String),
      $groups: {
        chain: 'manifest-ledger-testnet',
        wallet_type: 'Test Wallet',
      },
    });

    expect(mockPostHog.setPersonProperties).toHaveBeenCalledWith({
      last_successful_transaction: expect.any(String),
      last_transaction_hash: 'test-hash',
    });
  });

  test('tracks failed transaction', async () => {
    const wrapper = renderWithChainProvider(<TestComponent />);

    await waitFor(() => {
      expect(wrapper.getByTestId('is-ready')).toHaveTextContent('ready');
    });

    wrapper.getByTestId('track-failure').click();

    expect(mockPostHog.capture).toHaveBeenCalledWith('transaction_failed', {
      success: false,
      transactionHash: 'test-hash-fail',
      chainId: 'manifest-ledger-testnet',
      messageTypes: ['/cosmos.bank.v1beta1.MsgSend'],
      error: 'Transaction failed',
      wallet_address: 'manifest1test',
      wallet_name: 'Test Wallet',
      timestamp: expect.any(String),
      $groups: {
        chain: 'manifest-ledger-testnet',
        wallet_type: 'Test Wallet',
      },
    });

    expect(mockPostHog.setPersonProperties).toHaveBeenCalledWith({
      last_failed_transaction: expect.any(String),
      last_error: 'Transaction failed',
    });
  });

  test('does not track when PostHog is not available', async () => {
    // Mock PostHog as null
    mockModule(
      'posthog-js/react',
      () => ({
        usePostHog: jest.fn().mockReturnValue(null),
      }),
      true
    );

    const wrapper = renderWithChainProvider(<TestComponent />);

    await waitFor(() => {
      expect(wrapper.getByTestId('posthog-available')).toHaveTextContent('not available');
    });

    wrapper.getByTestId('track-success').click();

    // Should not have called any PostHog methods
    expect(mockPostHog.capture).not.toHaveBeenCalled();
    expect(mockPostHog.setPersonProperties).not.toHaveBeenCalled();
  });

  test('updates person properties when address matches', async () => {
    const wrapper = renderWithChainProvider(<TestComponent />);

    await waitFor(() => {
      expect(wrapper.getByTestId('is-ready')).toHaveTextContent('ready');
    });

    // Track a transaction - this should work normally
    wrapper.getByTestId('track-success').click();

    // Should capture transaction
    expect(mockPostHog.capture).toHaveBeenCalledWith(
      'transaction_success',
      expect.objectContaining({
        wallet_address: 'manifest1test',
      })
    );

    // Should update person properties since address matches
    expect(mockPostHog.setPersonProperties).toHaveBeenCalledWith({
      last_successful_transaction: expect.any(String),
      last_transaction_hash: 'test-hash',
    });
  });

  test('handles wallet without prettyName', async () => {
    // Mock wallet without prettyName
    mockModule(
      '@cosmos-kit/react',
      () => ({
        useChain: jest.fn().mockReturnValue({
          address: 'manifest1test',
          wallet: { mode: 'extension' }, // No prettyName
          isWalletConnected: true,
        }),
      }),
      true
    );

    const wrapper = renderWithChainProvider(<TestComponent />);

    await waitFor(() => {
      expect(mockPostHog.identify).toHaveBeenCalledWith('manifest1test', {
        wallet_address: 'manifest1test',
        wallet_name: null,
        wallet_mode: 'extension',
        chain_id: 'manifest-ledger-testnet',
        chain_name: 'manifesttestnet',
        last_connected: expect.any(String),
      });
    });

    wrapper.getByTestId('track-success').click();

    expect(mockPostHog.capture).toHaveBeenLastCalledWith(
      'transaction_success',
      expect.objectContaining({
        wallet_name: undefined,
        $groups: {
          chain: 'manifest-ledger-testnet',
          wallet_type: 'unknown',
        },
      })
    );
  });

  test('is not ready when wallet is not connected', async () => {
    // Mock wallet as not connected
    mockModule(
      '@cosmos-kit/react',
      () => ({
        useChain: jest.fn().mockReturnValue({
          address: null,
          wallet: null,
          isWalletConnected: false,
        }),
      }),
      true
    );

    const wrapper = renderWithChainProvider(<TestComponent />);

    await waitFor(() => {
      expect(wrapper.getByTestId('is-ready')).toHaveTextContent('not ready');
    });
  });

  test('does not re-identify same address and wallet (comprehensive test)', async () => {
    // Create a controllable test component that can simulate state changes
    let mockChainData = {
      address: null as string | null,
      wallet: null as any,
      isWalletConnected: false,
    };

    const ControllableTestComponent = () => {
      const [, forceUpdate] = React.useState({});
      React.useEffect(() => {
        // Store the force update function globally so we can trigger it
        (window as any).forceTestUpdate = () => forceUpdate({});
      }, []);

      // Mock useChain to return our controllable data
      mockModule(
        '@cosmos-kit/react',
        () => ({
          useChain: jest.fn().mockReturnValue(mockChainData),
        }),
        true
      );

      const { posthog, isReady } = useManifestPostHog();
      return (
        <div>
          <div data-testid="is-ready">{isReady ? 'ready' : 'not ready'}</div>
          <div data-testid="posthog-available">{posthog ? 'available' : 'not available'}</div>
        </div>
      );
    };

    renderWithChainProvider(<ControllableTestComponent />);

    // Initial state - not connected
    await waitFor(() => {
      expect(mockPostHog.identify).not.toHaveBeenCalled();
    });

    // Connect wallet - should trigger identification
    mockChainData = {
      address: 'manifest1test',
      wallet: mockWallet,
      isWalletConnected: true,
    };
    (window as any).forceTestUpdate();

    await waitFor(() => {
      expect(mockPostHog.identify).toHaveBeenCalledTimes(1);
      expect(mockPostHog.capture).toHaveBeenCalledWith('wallet_connected', expect.any(Object));
    });

    // Clear mocks
    mockPostHog.identify.mockClear();
    mockPostHog.capture.mockClear();

    // Trigger multiple state updates with same wallet - should NOT re-identify
    (window as any).forceTestUpdate();
    (window as any).forceTestUpdate();
    (window as any).forceTestUpdate();

    // Should not have called identify again
    expect(mockPostHog.identify).toHaveBeenCalledTimes(0);
    expect(mockPostHog.capture).not.toHaveBeenCalledWith('wallet_connected', expect.any(Object));

    // Change wallet - should trigger re-identification
    mockChainData = {
      address: 'manifest1test',
      wallet: { prettyName: 'Different Wallet', mode: 'mobile' },
      isWalletConnected: true,
    };
    (window as any).forceTestUpdate();

    await waitFor(() => {
      expect(mockPostHog.identify).toHaveBeenCalledTimes(1);
      expect(mockPostHog.identify).toHaveBeenCalledWith(
        'manifest1test',
        expect.objectContaining({
          wallet_name: 'Different Wallet',
          wallet_mode: 'mobile',
        })
      );
    });
  });
});
