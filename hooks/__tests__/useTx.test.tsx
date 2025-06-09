import { cleanup, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test';
import React from 'react';

import { clearAllMocks, mockModule, mockRouter } from '@/tests';
import { renderWithWeb3AuthProvider } from '@/tests/render';

import { useTx } from '../useTx';

// Mock the config/env module
const mockEnv = {
  osmosisChain: 'osmosis-1',
  osmosisExplorerUrl: 'https://osmosis.explorer.com',
  explorerUrl: 'https://testnet.manifest.explorers.guru',
};

interface TestComponentProps {
  chainName?: string;
  promptId?: string;
}

function TestComponent({ chainName = 'manifesttestnet', promptId }: TestComponentProps) {
  const { tx, isSigning } = useTx(chainName, promptId);

  const handleSimulate = () => {
    tx([{ typeUrl: '/cosmos.bank.v1beta1.MsgSend', value: { toAddress: 'test' } }], {
      simulate: true,
    });
  };

  const handleTxWithFeeFunction = () => {
    tx([{ typeUrl: '/cosmos.bank.v1beta1.MsgSend', value: { toAddress: 'test' } }], {
      fee: async () => ({ amount: [{ amount: '1000', denom: 'umfx' }], gas: '200000' }),
      returnError: true,
    });
  };

  const handleTxWithNoFee = () => {
    tx([{ typeUrl: '/cosmos.bank.v1beta1.MsgSend', value: { toAddress: 'test' } }], {
      returnError: true,
    });
  };

  const handleGroupProposal = () => {
    tx(
      [
        {
          typeUrl: '/cosmos.group.v1.MsgSubmitProposal',
          value: { groupPolicyAddress: 'test-policy-address' },
        },
      ],
      { returnError: true }
    );
  };

  const handleFailedTx = () => {
    tx([{ typeUrl: '/cosmos.bank.v1beta1.MsgSend', value: { toAddress: 'fail' } }], {
      returnError: true,
    });
  };

  const handleTxWithError = () => {
    tx([{ typeUrl: '/cosmos.bank.v1beta1.MsgSend', value: { toAddress: 'error' } }], {
      returnError: true,
    });
  };

  const handleSimulationError = () => {
    tx([{ typeUrl: '/cosmos.bank.v1beta1.MsgSend', value: { toAddress: 'sim-error' } }], {
      simulate: true,
      returnError: true,
    });
  };

  const handleTxNoErrorToast = () => {
    tx([{ typeUrl: '/cosmos.bank.v1beta1.MsgSend', value: { toAddress: 'fail' } }], {
      showToastOnErrors: false,
      returnError: true,
    });
  };

  return (
    <div>
      <div data-testid="is-signing">{isSigning ? 'signing' : 'not signing'}</div>
      <button data-testid="simulate" onClick={handleSimulate}>
        Simulate
      </button>
      <button data-testid="tx-fee-function" onClick={handleTxWithFeeFunction}>
        Tx with Fee Function
      </button>
      <button data-testid="tx-no-fee" onClick={handleTxWithNoFee}>
        Tx No Fee
      </button>
      <button data-testid="group-proposal" onClick={handleGroupProposal}>
        Group Proposal
      </button>
      <button data-testid="failed-tx" onClick={handleFailedTx}>
        Failed Tx
      </button>
      <button data-testid="tx-error" onClick={handleTxWithError}>
        Tx Error
      </button>
      <button data-testid="simulation-error" onClick={handleSimulationError}>
        Simulation Error
      </button>
      <button data-testid="tx-no-error-toast" onClick={handleTxNoErrorToast}>
        Tx No Error Toast
      </button>
    </div>
  );
}

describe('useTx', () => {
  let mockClient: any;
  let mockSetToastMessage: any;
  let mockTrackTransaction: any;
  let mockWeb3AuthContext: any;

  beforeEach(() => {
    // Mock Next.js router
    mockRouter();

    // Mock the env config
    mockModule('@/config/env', () => ({ default: mockEnv }));

    // Create mock client
    mockClient = {
      simulate: jest.fn().mockResolvedValue({ gasInfo: { gasUsed: 100000 } }),
      sign: jest
        .fn()
        .mockResolvedValue({ bodyBytes: new Uint8Array(), authInfoBytes: new Uint8Array() }),
      broadcastTx: jest.fn().mockResolvedValue({
        code: 0,
        transactionHash: 'test-hash',
        gasUsed: 100000,
        gasWanted: 110000,
        height: 12345,
        events: [],
      }),
    };

    // Mock toast
    mockSetToastMessage = jest.fn();

    // Mock PostHog tracking
    mockTrackTransaction = jest.fn();

    // Mock Web3Auth context
    mockWeb3AuthContext = {
      isSigning: false,
      setIsSigning: jest.fn(),
      setPromptId: jest.fn(),
    };

    // Mock dependencies
    mockModule('@cosmos-kit/react', () => ({
      useChain: jest.fn().mockReturnValue({
        address: 'manifest1test',
        getSigningStargateClient: jest.fn().mockResolvedValue(mockClient),
        estimateFee: jest.fn().mockResolvedValue({
          amount: [{ amount: '1000', denom: 'umfx' }],
          gas: '200000',
        }),
      }),
    }));

    mockModule('@/contexts/toastContext', () => ({
      useToast: jest.fn().mockReturnValue({
        setToastMessage: mockSetToastMessage,
      }),
    }));

    mockModule('@/hooks/usePostHog', () => ({
      useManifestPostHog: jest.fn().mockReturnValue({
        trackTransaction: mockTrackTransaction,
      }),
    }));

    // Mock cosmjs functions
    mockModule('@cosmjs/stargate', () => ({
      isDeliverTxSuccess: jest.fn().mockReturnValue(true),
    }));

    mockModule('cosmjs-types/cosmos/tx/v1beta1/tx', () => ({
      TxRaw: {
        encode: jest.fn().mockReturnValue({
          finish: jest.fn().mockReturnValue(new Uint8Array()),
        }),
      },
    }));
  });

  afterEach(() => {
    cleanup();
    clearAllMocks();
    jest.clearAllMocks();
  });

  test('handles wallet not connected', async () => {
    // Mock no address
    mockModule.force('@cosmos-kit/react', () => ({
      useChain: jest.fn().mockReturnValue({
        address: null,
        getSigningStargateClient: jest.fn(),
        estimateFee: jest.fn(),
      }),
    }));

    const wrapper = renderWithWeb3AuthProvider(<TestComponent />, mockWeb3AuthContext);

    wrapper.getByTestId('simulate').click();

    await waitFor(() => {
      expect(mockSetToastMessage).toHaveBeenCalledWith({
        type: 'alert-error',
        title: 'Wallet not connected',
        description: 'Please connect your wallet.',
        bgColor: '#e74c3c',
      });
    });
  });

  test('handles successful simulation', async () => {
    const wrapper = renderWithWeb3AuthProvider(<TestComponent />, mockWeb3AuthContext);

    wrapper.getByTestId('simulate').click();

    await waitFor(() => {
      expect(mockClient.simulate).toHaveBeenCalledWith(
        'manifest1test',
        [{ typeUrl: '/cosmos.bank.v1beta1.MsgSend', value: { toAddress: 'test' } }],
        ''
      );
    });
  });

  test('handles simulation error with message extraction', async () => {
    mockClient.simulate.mockRejectedValueOnce(
      new Error('message index: 0: insufficient funds [cosmos.bank.v1beta1.MsgSend]')
    );

    const wrapper = renderWithWeb3AuthProvider(<TestComponent />, mockWeb3AuthContext);

    wrapper.getByTestId('simulation-error').click();

    await waitFor(() => {
      expect(mockSetToastMessage).toHaveBeenCalledWith({
        type: 'alert-error',
        title: 'Simulation Failed',
        description: 'insufficient funds',
        bgColor: '#e74c3c',
      });
    });
  });

  test('handles simulation error with account does not exist', async () => {
    mockClient.simulate.mockRejectedValueOnce(
      new Error("Account 'manifest1test' does not exist on chain")
    );

    const wrapper = renderWithWeb3AuthProvider(<TestComponent />, mockWeb3AuthContext);

    wrapper.getByTestId('simulation-error').click();

    await waitFor(() => {
      expect(mockSetToastMessage).toHaveBeenCalledWith({
        type: 'alert-error',
        title: 'Simulation Failed',
        description: "Account 'manifest1test' does not exist on chain",
        bgColor: '#e74c3c',
      });
    });
  });

  test('handles fee function', async () => {
    const wrapper = renderWithWeb3AuthProvider(<TestComponent />, mockWeb3AuthContext);

    wrapper.getByTestId('tx-fee-function').click();

    await waitFor(() => {
      expect(mockClient.sign).toHaveBeenCalledWith(
        'manifest1test',
        [{ typeUrl: '/cosmos.bank.v1beta1.MsgSend', value: { toAddress: 'test' } }],
        { amount: [{ amount: '1000', denom: 'umfx' }], gas: '200000' },
        ''
      );
    });
  });

  test('handles fee estimation failure', async () => {
    // Mock estimateFee to return null
    mockModule.force('@cosmos-kit/react', () => ({
      useChain: jest.fn().mockReturnValue({
        address: 'manifest1test',
        getSigningStargateClient: jest.fn().mockResolvedValue(mockClient),
        estimateFee: jest.fn().mockResolvedValue(null),
      }),
    }));

    const wrapper = renderWithWeb3AuthProvider(<TestComponent />, mockWeb3AuthContext);

    wrapper.getByTestId('tx-no-fee').click();

    await waitFor(() => {
      // Should not proceed to sign since fee estimation failed
      expect(mockClient.sign).not.toHaveBeenCalled();
    });
  });

  test('tracks successful transaction', async () => {
    const wrapper = renderWithWeb3AuthProvider(<TestComponent />, mockWeb3AuthContext);

    wrapper.getByTestId('tx-fee-function').click();

    await waitFor(() => {
      expect(mockTrackTransaction).toHaveBeenCalledWith({
        success: true,
        transactionHash: 'test-hash',
        chainId: 'manifesttestnet',
        messageTypes: ['/cosmos.bank.v1beta1.MsgSend'],
        fee: {
          amount: '1000',
          denom: 'umfx',
        },
        memo: undefined,
        gasUsed: '100000',
        gasWanted: '110000',
        height: '12345',
      });
    });
  });

  test('handles group proposal submission', async () => {
    // Mock successful response with group proposal event
    mockClient.broadcastTx.mockResolvedValueOnce({
      code: 0,
      transactionHash: 'test-hash',
      gasUsed: 100000,
      gasWanted: 110000,
      height: 12345,
      events: [
        {
          type: 'cosmos.group.v1.EventSubmitProposal',
          attributes: [{ key: 'proposal_id', value: '"123"' }],
        },
      ],
    });

    const wrapper = renderWithWeb3AuthProvider(<TestComponent />, mockWeb3AuthContext);

    wrapper.getByTestId('group-proposal').click();

    await waitFor(() => {
      // Verify we got both broadcasting and success toasts
      expect(mockSetToastMessage).toHaveBeenCalledTimes(2);

      // Check the first call was broadcasting toast
      expect(mockSetToastMessage).toHaveBeenNthCalledWith(1, {
        type: 'alert-info',
        title: 'Broadcasting',
        description: 'Transaction is signed and is being broadcasted...',
        bgColor: '#3498db',
      });

      // Check the second call was the success toast
      expect(mockSetToastMessage).toHaveBeenNthCalledWith(2, {
        type: 'alert-success',
        title: 'Proposal Submitted',
        description: 'Proposal submitted successfully',
        link: '/groups?policyAddress=test-policy-address&tab=proposals&proposalId=123',
        explorerLink: 'https://testnet.manifest.explorers.guru/transaction/test-hash',
        bgColor: '#2ecc71',
      });
    });
  });

  test('handles failed transaction', async () => {
    // Mock failed transaction
    mockModule.force('@cosmjs/stargate', () => ({
      isDeliverTxSuccess: jest.fn().mockReturnValue(false),
    }));

    mockClient.broadcastTx.mockResolvedValueOnce({
      code: 1,
      transactionHash: 'test-hash-fail',
      gasUsed: 100000,
      gasWanted: 110000,
      height: 12345,
      rawLog: 'Transaction failed due to insufficient funds',
    });

    const wrapper = renderWithWeb3AuthProvider(<TestComponent />, mockWeb3AuthContext);

    wrapper.getByTestId('failed-tx').click();

    await waitFor(() => {
      expect(mockTrackTransaction).toHaveBeenCalledWith({
        success: false,
        transactionHash: 'test-hash-fail',
        chainId: 'manifesttestnet',
        messageTypes: ['/cosmos.bank.v1beta1.MsgSend'],
        fee: {
          amount: '1000',
          denom: 'umfx',
        },
        memo: undefined,
        error: 'Transaction failed due to insufficient funds',
        gasUsed: '100000',
        gasWanted: '110000',
        height: '12345',
      });

      expect(mockSetToastMessage).toHaveBeenCalledWith({
        type: 'alert-error',
        title: 'Transaction Failed',
        description: 'Transaction failed due to insufficient funds',
        bgColor: '#e74c3c',
      });
    });
  });

  test('handles transaction error with exception', async () => {
    mockClient.broadcastTx.mockRejectedValueOnce(new Error('Network error'));

    const wrapper = renderWithWeb3AuthProvider(<TestComponent />, mockWeb3AuthContext);

    wrapper.getByTestId('tx-error').click();

    await waitFor(() => {
      expect(mockSetToastMessage).toHaveBeenCalledWith({
        type: 'alert-error',
        title: 'Transaction Failed',
        description: 'Network error',
        bgColor: '#e74c3c',
      });
    });
  });

  test('suppresses error toast when showToastOnErrors is false', async () => {
    // Mock failed transaction
    mockModule.force('@cosmjs/stargate', () => ({
      isDeliverTxSuccess: jest.fn().mockReturnValue(false),
    }));

    mockClient.broadcastTx.mockResolvedValueOnce({
      code: 1,
      transactionHash: 'test-hash-fail',
      rawLog: 'Transaction failed',
    });

    const wrapper = renderWithWeb3AuthProvider(<TestComponent />, mockWeb3AuthContext);

    wrapper.getByTestId('tx-no-error-toast').click();

    await waitFor(() => {
      // Should track transaction but not show error toast
      expect(mockTrackTransaction).toHaveBeenCalled();
      // Should not have called setToastMessage for error (only for broadcasting info)
      const errorToastCalls = mockSetToastMessage.mock.calls.filter(
        (call: any) => call[0].type === 'alert-error'
      );
      expect(errorToastCalls).toHaveLength(0);
    });
  });

  test('uses osmosis explorer URL for osmosis chain', async () => {
    const wrapper = renderWithWeb3AuthProvider(
      <TestComponent chainName="osmosis-1" />,
      mockWeb3AuthContext
    );

    wrapper.getByTestId('tx-fee-function').click();

    await waitFor(() => {
      // Verify we got both broadcasting and success toasts
      expect(mockSetToastMessage).toHaveBeenCalledTimes(2);

      // Check the first call was broadcasting toast
      expect(mockSetToastMessage).toHaveBeenNthCalledWith(1, {
        type: 'alert-info',
        title: 'Broadcasting',
        description: 'Transaction is signed and is being broadcasted...',
        bgColor: '#3498db',
      });

      // Check the second call was the success toast with osmosis explorer URL
      expect(mockSetToastMessage).toHaveBeenNthCalledWith(2, {
        type: 'alert-success',
        title: 'Transaction Successful',
        description: 'Transaction completed successfully',
        link: 'https://osmosis.explorer.com/transaction/test-hash',
        bgColor: '#2ecc71',
      });
    });
  });

  test('sets signing state and prompt ID correctly', async () => {
    const wrapper = renderWithWeb3AuthProvider(
      <TestComponent promptId="test-prompt" />,
      mockWeb3AuthContext
    );

    wrapper.getByTestId('tx-fee-function').click();

    await waitFor(() => {
      expect(mockWeb3AuthContext.setIsSigning).toHaveBeenCalledWith(true);
      expect(mockWeb3AuthContext.setPromptId).toHaveBeenCalledWith('test-prompt');
    });

    await waitFor(() => {
      expect(mockWeb3AuthContext.setIsSigning).toHaveBeenCalledWith(false);
      expect(mockWeb3AuthContext.setPromptId).toHaveBeenCalledWith(undefined);
    });
  });

  test('shows broadcasting toast before transaction submission', async () => {
    const wrapper = renderWithWeb3AuthProvider(<TestComponent />, mockWeb3AuthContext);

    wrapper.getByTestId('tx-fee-function').click();

    await waitFor(() => {
      expect(mockSetToastMessage).toHaveBeenCalledWith({
        type: 'alert-info',
        title: 'Broadcasting',
        description: 'Transaction is signed and is being broadcasted...',
        bgColor: '#3498db',
      });
    });
  });

  test('calls onSuccess callback when provided', async () => {
    const onSuccess = jest.fn();

    function TestComponentWithCallback() {
      const { tx } = useTx('manifesttestnet');

      const handleTx = () => {
        tx([{ typeUrl: '/cosmos.bank.v1beta1.MsgSend', value: { toAddress: 'test' } }], {
          onSuccess,
        });
      };

      return <button data-testid="tx-with-callback" onClick={handleTx} />;
    }

    const wrapper = renderWithWeb3AuthProvider(<TestComponentWithCallback />, mockWeb3AuthContext);

    wrapper.getByTestId('tx-with-callback').click();

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
