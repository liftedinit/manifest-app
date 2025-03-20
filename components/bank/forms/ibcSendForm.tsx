'use client';

import { OfflineAminoSigner } from '@cosmjs/amino';
import { StdSignDoc } from '@cosmjs/amino';
import { OfflineDirectSigner } from '@cosmjs/proto-signing';
import { useChain } from '@cosmos-kit/react';
import { Widget } from '@skip-go/widget';
import { useQueryClient } from '@tanstack/react-query';
import { assets as axelarAssets } from 'chain-registry/testnet/axelartestnet';
import { assets as osmosisAssets } from 'chain-registry/testnet/osmosistestnet';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { useContext, useEffect, useRef } from 'react';
import { ShadowScopeConfigProvider } from 'react-shadow-scope';

import env from '@/config/env';
import { useTheme } from '@/contexts';
import { Web3AuthContext } from '@/contexts/web3AuthContext';
import { getIbcDenom } from '@/utils/ibc';

function IbcSendForm({ token }: { token: string }) {
  const { theme } = useTheme();
  const { address, getSigningStargateClient } = useChain(env.chain);
  const ibcDenom = getIbcDenom(env.chainId, token);
  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { setIsSigning } = useContext(Web3AuthContext);

  async function getCosmosSigner(): Promise<OfflineAminoSigner | OfflineDirectSigner> {
    const client = await getSigningStargateClient();
    if (!('signer' in client)) {
      throw new Error('No cosmos stargate client.');
    }
    const signer: OfflineAminoSigner | OfflineDirectSigner = (client as any).signer;

    // Find out which type of signer we have from the Stargate client,
    // then declare the right sign function which also set isSigning.
    if ('signAmino' in signer) {
      return {
        getAccounts: signer.getAccounts.bind(signer),
        signAmino: async (address: string, doc: StdSignDoc) => {
          setIsSigning(true);

          try {
            return await signer.signAmino(address, doc);
          } finally {
            setIsSigning(false);
          }
        },
      };
    } else if ('signDirect' in signer) {
      return {
        getAccounts: signer.getAccounts.bind(signer),
        signDirect: async (address: string, doc: SignDoc) => {
          setIsSigning(true);

          try {
            return await signer.signDirect(address, doc);
          } finally {
            setIsSigning(false);
          }
        },
      };
    } else {
      throw new Error('Invalid signer from stargate client.');
    }
  }

  // Determine if dark mode is active
  const isDark = theme === 'dark';

  const themeColors = {
    brandColor: '#a087ff',
    primary: {
      background: {
        normal: isDark ? '#302E41' : '#FCFCFF',
      },
      text: {
        normal: isDark ? '#FFFFFF' : '#161616',
        lowContrast: isDark ? '#f0f0ff' : '#1d192d',
        ultraLowContrast: isDark ? '#e0e0ff' : '#f0f0ff',
      },
      ghostButtonHover: '#b19aff',
    },
    secondary: {
      background: {
        normal: '#a087ff',
        transparent: 'transparent',
        hover: isDark ? '#a087ff' : '#a087ff',
      },
    },
    success: {
      text: '#4caf50',
    },
    warning: {
      background: '#ffb300',
      text: '#161616',
    },
    error: {
      background: '#e53935',
      text: '#ffffff',
    },
  };

  // filter osmosis tokens that are on manifesttestnet
  const manifestAssetsOnOsmosis = osmosisAssets.assets
    .filter(asset =>
      asset?.traces?.some(
        trace => trace.type === 'ibc' && trace.counterparty.chain_name === 'manifesttestnet'
      )
    )
    .map(asset => asset.base);

  // filter axelar tokens that are on manifesttestnet
  const manifestAssetsOnAxelar = axelarAssets.assets
    .filter(asset =>
      asset?.traces?.some(
        trace => trace.type === 'ibc' && trace.counterparty.chain_name === 'manifesttestnet'
      )
    )
    .map(asset => asset.base);
  console.log();
  return (
    <div
      aria-label="ibc-send-form"
      ref={containerRef}
      className="w-[100%] max-w-[500px] px-2 box-border relative"
    >
      <Widget
        filter={{
          source: {
            [env.chainId]: undefined,
            [env.osmosisChainId]: [...manifestAssetsOnOsmosis, 'uosmo'],
            [env.axelarChainId]: [...manifestAssetsOnAxelar, 'uaxl'],
          },
          destination: {
            [env.chainId]: undefined,
            [env.osmosisChainId]: [...manifestAssetsOnOsmosis, 'uosmo'],
            [env.axelarChainId]: [...manifestAssetsOnAxelar, 'uaxl'],
          },
        }}
        defaultRoute={{
          srcAssetDenom: token,
          srcChainId: env.chainId,
          destChainId: env.osmosisChainId,
          destAssetDenom: ibcDenom,
          amountIn: 1,
          amountOut: 1,
        }}
        routeConfig={{
          allowUnsafe: true,
          allowSwaps: true,
        }}
        brandColor={'#a087ff'}
        onlyTestnet={true}
        getCosmosSigner={getCosmosSigner}
        connectedAddresses={{
          [env.chainId]: address,
        }}
        onTransactionComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['balances'] });
          queryClient.invalidateQueries({ queryKey: ['balances-resolved'] });
          queryClient.invalidateQueries({ queryKey: ['getMessagesForAddress'] });
        }}
        theme={themeColors}
        disableShadowDom={true}
      />
    </div>
  );
}

export default IbcSendForm;
