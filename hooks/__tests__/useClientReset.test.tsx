import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test';
import React from 'react';

import { Web3AuthContext } from '@/contexts/web3AuthContext';
import { clearAllMocks, mockModule } from '@/tests';

import { useClientReset } from '../useClientReset';

describe('useClientReset', () => {
  let mockResetWeb3AuthClients: any;
  let mockForceChainProviderReset: any;
  let mockWeb3AuthContextValue: any;
  let mockQueryClient: any;

  beforeEach(() => {
    mockResetWeb3AuthClients = jest.fn().mockResolvedValue(undefined);
    mockForceChainProviderReset = jest.fn();

    mockWeb3AuthContextValue = {
      resetWeb3AuthClients: mockResetWeb3AuthClients,
      forceChainProviderReset: mockForceChainProviderReset,
      isSigning: false,
      setIsSigning: jest.fn(),
      setPromptId: jest.fn(),
    };

    mockQueryClient = {
      clear: jest.fn(),
    };

    // Mock react-query
    mockModule('@tanstack/react-query', () => ({
      useQueryClient: () => mockQueryClient,
    }));
  });

  afterEach(() => {
    cleanup();
    clearAllMocks();
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Web3AuthContext.Provider value={mockWeb3AuthContextValue}>{children}</Web3AuthContext.Provider>
  );

  test('returns forceCompleteReset function', () => {
    const { result } = renderHook(() => useClientReset(), { wrapper });

    expect(result.current.forceCompleteReset).toBeDefined();
    expect(typeof result.current.forceCompleteReset).toBe('function');
  });

  test('forceCompleteReset performs complete reset when forceChainProviderReset is available', async () => {
    const { result } = renderHook(() => useClientReset(), { wrapper });

    const resetResult = await result.current.forceCompleteReset();

    expect(resetResult).toBe(true);
    expect(mockResetWeb3AuthClients).toHaveBeenCalledTimes(1);
    expect(mockForceChainProviderReset).toHaveBeenCalledTimes(1);
    expect(mockQueryClient.clear).toHaveBeenCalledTimes(1);
  });

  test('forceCompleteReset returns false when forceChainProviderReset is not available', async () => {
    mockWeb3AuthContextValue.forceChainProviderReset = undefined;

    const { result } = renderHook(() => useClientReset(), { wrapper });

    const resetResult = await result.current.forceCompleteReset();

    expect(resetResult).toBe(false);
    expect(mockResetWeb3AuthClients).not.toHaveBeenCalled();
    expect(mockQueryClient.clear).not.toHaveBeenCalled();
  });

  test('forceCompleteReset handles reset errors gracefully', async () => {
    mockResetWeb3AuthClients.mockRejectedValueOnce(new Error('Reset failed'));

    const { result } = renderHook(() => useClientReset(), { wrapper });

    await expect(result.current.forceCompleteReset()).rejects.toThrow('Reset failed');

    expect(mockResetWeb3AuthClients).toHaveBeenCalledTimes(1);
  });

  test('callback is memoized correctly', () => {
    const { result, rerender } = renderHook(() => useClientReset(), { wrapper });

    const firstCallback = result.current.forceCompleteReset;

    rerender();

    const secondCallback = result.current.forceCompleteReset;

    expect(firstCallback).toBe(secondCallback);
  });
});
