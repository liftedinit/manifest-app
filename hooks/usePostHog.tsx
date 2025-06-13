import { useChain } from '@cosmos-kit/react';
import { usePostHog } from 'posthog-js/react';
import { useEffect, useRef } from 'react';

import env from '@/config/env';

interface TransactionEvent {
  success: boolean;
  transactionHash?: string;
  chainId: string;
  messageTypes: string[];
  fee?: {
    amount: string;
    denom: string;
  };
  memo?: string;
  error?: string;
  gasUsed?: string;
  gasWanted?: string;
  height?: string;
}

export const useManifestPostHog = () => {
  const posthog = usePostHog();
  const { address, wallet, isWalletConnected } = useChain(env.chain);
  const identifiedAddress = useRef<string | null>(null);
  const lastWalletName = useRef<string | null>(null);

  // Only identify user once per address or when wallet changes
  useEffect(() => {
    if (isWalletConnected && address && posthog) {
      const walletName = wallet?.prettyName || null;

      // Only identify if this is a new address or different wallet
      if (identifiedAddress.current !== address || lastWalletName.current !== walletName) {
        posthog.identify(address, {
          wallet_address: address,
          wallet_name: walletName,
          wallet_mode: wallet?.mode,
          chain_id: env.chainId,
          chain_name: env.chain,
          last_connected: new Date().toISOString(),
        });

        // Track wallet connection event
        posthog.capture('wallet_connected', {
          wallet_address: address,
          wallet_name: walletName,
          wallet_mode: wallet?.mode,
          chain_id: env.chainId,
          chain_name: env.chain,
        });

        // Update refs to track what we've identified
        identifiedAddress.current = address;
        lastWalletName.current = walletName;
      }
    }
  }, [isWalletConnected, address, wallet, posthog]);

  // Reset identification when wallet disconnects
  useEffect(() => {
    if (!isWalletConnected && posthog && identifiedAddress.current) {
      // Track wallet disconnection event before resetting
      posthog.capture('wallet_disconnected', {
        chain_id: env.chainId,
        chain_name: env.chain,
        previous_address: identifiedAddress.current,
      });

      posthog.reset();
      identifiedAddress.current = null;
      lastWalletName.current = null;
    }
  }, [isWalletConnected, posthog]);

  const trackTransaction = (event: TransactionEvent) => {
    if (!posthog) return;

    const eventName = event.success ? 'transaction_success' : 'transaction_failed';

    posthog.capture(eventName, {
      ...event,
      wallet_address: address,
      wallet_name: wallet?.prettyName,
      timestamp: new Date().toISOString(),
      // Feature flags and cohorts can be automatically included
      $groups: {
        chain: env.chainId,
        wallet_type: wallet?.prettyName || 'unknown',
      },
    });

    // Update user properties with latest transaction info (minimal updates)
    const updateProperties: Record<string, any> = {};

    if (event.success) {
      updateProperties.last_successful_transaction = new Date().toISOString();
      if (event.transactionHash) {
        updateProperties.last_transaction_hash = event.transactionHash;
      }
    } else {
      updateProperties.last_failed_transaction = new Date().toISOString();
      if (event.error) {
        updateProperties.last_error = event.error;
      }
    }

    // Only update if we have properties to set and user is identified
    if (Object.keys(updateProperties).length > 0 && identifiedAddress.current === address) {
      posthog.setPersonProperties(updateProperties);
    }
  };

  return {
    posthog,
    trackTransaction,
    isReady: !!posthog && isWalletConnected,
  };
};
