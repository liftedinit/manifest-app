import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useContext } from 'react';

import { Web3AuthContext } from '@/contexts/web3AuthContext';

/**
 * Hook to force complete reset of cosmos-kit and Web3Auth clients.
 * This completely re-mounts the ChainProvider to clear all cached state.
 */
export const useClientReset = () => {
  const { resetWeb3AuthClients, forceChainProviderReset } = useContext(Web3AuthContext);
  const queryClient = useQueryClient();

  const forceCompleteReset = useCallback(async () => {
    if (forceChainProviderReset) {
      // Reset Web3Auth state
      await resetWeb3AuthClients();

      // Clear all caches
      queryClient.clear();

      // Force complete re-mount
      forceChainProviderReset();

      return true;
    } else {
      return false;
    }
  }, [forceChainProviderReset, resetWeb3AuthClients, queryClient]);

  return {
    forceCompleteReset,
  };
};
