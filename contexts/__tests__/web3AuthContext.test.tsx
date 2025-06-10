import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test';
import React from 'react';

import { clearAllMocks, mockModule } from '@/tests';

import { Web3AuthContext, Web3AuthProvider } from '../web3AuthContext';

describe('Web3AuthContext', () => {
  beforeEach(() => {
    // Mock the required modules
    mockModule('@cosmos-kit/web3auth', () => ({
      makeWeb3AuthWallets: jest.fn().mockReturnValue([]),
      Web3AuthWallet: class MockWeb3AuthWallet {
        walletStatus = 'Disconnected';
        walletInfo = { name: 'test-wallet' };
        client = {
          setLoginHint: jest.fn(),
        };
        async disconnect() {
          return Promise.resolve();
        }
      },
      Web3AuthClient: class MockWeb3AuthClient {
        setLoginHint = jest.fn();
      },
    }));

    mockModule('@web3auth/auth', () => ({
      WEB3AUTH_NETWORK_TYPE: {
        TESTNET: 'testnet',
        MAINNET: 'mainnet',
      },
    }));

    mockModule('cosmos-kit', () => ({
      wallets: {
        for: jest.fn().mockReturnValue([]),
      },
    }));

    mockModule('@cosmos-kit/cosmos-extension-metamask', () => ({
      wallets: [],
    }));

    // Mock environment config
    mockModule('@/config/env', () => ({
      default: {
        web3AuthNetwork: 'testnet',
        web3AuthClientId: 'test-client-id',
      },
    }));
  });

  afterEach(() => {
    cleanup();
    clearAllMocks();
    jest.clearAllMocks();
  });

  test('provides resetWeb3AuthClients function', () => {
    const TestComponent = () => {
      const context = React.useContext(Web3AuthContext);
      return <div data-testid="reset-type">{typeof context.resetWeb3AuthClients}</div>;
    };

    const { getByTestId } = render(
      <Web3AuthProvider>
        <TestComponent />
      </Web3AuthProvider>
    );
    expect(getByTestId('reset-type').textContent).toBe('function');
  });

  test('context provides all required values', () => {
    const TestComponent = () => {
      const context = React.useContext(Web3AuthContext);
      return (
        <div>
          <span data-testid="is-signing">{context.isSigning.toString()}</span>
          <span data-testid="set-signing">{typeof context.setIsSigning}</span>
          <span data-testid="set-prompt">{typeof context.setPromptId}</span>
          <span data-testid="reset-clients">{typeof context.resetWeb3AuthClients}</span>
          <span data-testid="wallets-length">{context.wallets.length}</span>
        </div>
      );
    };

    const { getByTestId } = render(
      <Web3AuthProvider>
        <TestComponent />
      </Web3AuthProvider>
    );

    expect(getByTestId('is-signing').textContent).toBe('false');
    expect(getByTestId('set-signing').textContent).toBe('function');
    expect(getByTestId('set-prompt').textContent).toBe('function');
    expect(getByTestId('reset-clients').textContent).toBe('function');
    expect(parseInt(getByTestId('wallets-length').textContent || '0')).toBeGreaterThanOrEqual(0);
  });

  test('resetWeb3AuthClients can be called without errors', async () => {
    let resetFunction: (() => Promise<void>) | undefined;

    const TestComponent = () => {
      const context = React.useContext(Web3AuthContext);
      resetFunction = context.resetWeb3AuthClients;
      return <div>test</div>;
    };

    render(
      <Web3AuthProvider>
        <TestComponent />
      </Web3AuthProvider>
    );

    expect(resetFunction).toBeDefined();
    if (resetFunction) {
      // Should not throw
      await expect(resetFunction()).resolves.toBeUndefined();
    }
  });

  test('isSigning state management works correctly', () => {
    let setSigningFunction: ((isSigning: boolean) => void) | undefined;
    let isSigningValue: boolean | undefined;

    const TestComponent = () => {
      const context = React.useContext(Web3AuthContext);
      setSigningFunction = context.setIsSigning;
      isSigningValue = context.isSigning;
      return (
        <div>
          <span data-testid="signing-state">{context.isSigning.toString()}</span>
        </div>
      );
    };

    const { getByTestId, rerender } = render(
      <Web3AuthProvider>
        <TestComponent />
      </Web3AuthProvider>
    );

    // Initial state should be false
    expect(getByTestId('signing-state').textContent).toBe('false');

    // Set signing to true
    if (setSigningFunction) {
      setSigningFunction(true);
      rerender(
        <Web3AuthProvider>
          <TestComponent />
        </Web3AuthProvider>
      );
      expect(getByTestId('signing-state').textContent).toBe('true');

      // Set signing back to false
      setSigningFunction(false);
      rerender(
        <Web3AuthProvider>
          <TestComponent />
        </Web3AuthProvider>
      );
      expect(getByTestId('signing-state').textContent).toBe('false');
    }
  });

  test('promptId state management works correctly', () => {
    let setPromptIdFunction: ((promptId: string | undefined) => void) | undefined;

    const TestComponent = () => {
      const context = React.useContext(Web3AuthContext);
      setPromptIdFunction = context.setPromptId;
      return (
        <div>
          <span data-testid="prompt-id">{context.promptId || 'undefined'}</span>
        </div>
      );
    };

    const { getByTestId, rerender } = render(
      <Web3AuthProvider>
        <TestComponent />
      </Web3AuthProvider>
    );

    // Initial state should be undefined
    expect(getByTestId('prompt-id').textContent).toBe('undefined');

    // Set prompt ID
    if (setPromptIdFunction) {
      setPromptIdFunction('test-prompt');
      rerender(
        <Web3AuthProvider>
          <TestComponent />
        </Web3AuthProvider>
      );
      expect(getByTestId('prompt-id').textContent).toBe('test-prompt');

      // Clear prompt ID
      setPromptIdFunction(undefined);
      rerender(
        <Web3AuthProvider>
          <TestComponent />
        </Web3AuthProvider>
      );
      expect(getByTestId('prompt-id').textContent).toBe('undefined');
    }
  });
});
