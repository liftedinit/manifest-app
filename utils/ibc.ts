import { Asset, AssetList, IBCInfo } from '@chain-registry/types';

import { Coin } from '@liftedinit/manifestjs/dist/codegen/cosmos/base/v1beta1/coin';

import { shiftDigits } from './maths';
import { assets as manifestAssets } from 'chain-registry/testnet/manifesttestnet';
import { assets as osmosisAssets } from 'chain-registry/testnet/osmosistestnet';
import { ChainContext } from '@cosmos-kit/core';

//TODO: use chain-registry when the package is updated

const manifestAssetList: AssetList = {
  chain_name: 'manifesttestnet',
  assets: [
    ...manifestAssets.assets,
    {
      description: 'Osmosis token on Manifest Ledger Testnet',
      denom_units: [
        {
          denom: 'ibc/ED07A3391A112B175915CD8FAF43A2DA8E4790EDE12566649D0C2F97716B8518',
          exponent: 0,
          aliases: ['uosmo'],
        },
        {
          denom: 'osmo',
          exponent: 6,
        },
      ],
      type_asset: 'ics20',
      base: 'ibc/ED07A3391A112B175915CD8FAF43A2DA8E4790EDE12566649D0C2F97716B8518',
      name: 'Osmosis',
      display: 'osmo',
      symbol: 'OSMO',
      traces: [
        {
          type: 'ibc',
          counterparty: {
            chain_name: 'osmosistestnet',
            base_denom: 'uosmo',
            channel_id: 'channel-10016',
          },
          chain: {
            channel_id: 'channel-0',
            path: 'transfer/channel-0/uosmo',
          },
        },
      ],
      images: [
        {
          image_sync: {
            chain_name: 'osmosistestnet',
            base_denom: 'uosmo',
          },
          svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg',
          png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png',
        },
      ],
      logo_URIs: {
        png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png',
        svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg',
      },
    },
  ],
};

const osmosisAssetList: AssetList = {
  chain_name: 'osmosistestnet',
  assets: [
    ...osmosisAssets.assets,
    {
      description: 'Manifest Testnet Token',
      denom_units: [
        {
          denom: 'ibc/8402769A51AEE1CDF35223998D284E937EBF03F4A2CE43EC10BB028BB5AD29C8',
          exponent: 0,
          aliases: ['umfx'],
        },
        {
          denom: 'mfx',
          exponent: 6,
        },
      ],
      type_asset: 'ics20',
      base: 'ibc/8402769A51AEE1CDF35223998D284E937EBF03F4A2CE43EC10BB028BB5AD29C8',
      name: 'Manifest Testnet',
      display: 'mfx',
      symbol: 'MFX',
      traces: [
        {
          type: 'ibc',
          counterparty: {
            chain_name: 'manifesttestnet',
            base_denom: 'umfx',
            channel_id: 'channel-0',
          },
          chain: {
            channel_id: 'channel-10016',
            path: 'transfer/channel-10016/umfx',
          },
        },
      ],
      logo_URIs: {
        png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/testnets/manifesttestnet/images/mfx.png',
        svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/testnets/manifesttestnet/images/mfx.svg',
      },
      images: [
        {
          image_sync: {
            chain_name: 'manifesttestnet',
            base_denom: 'umfx',
          },
          png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/testnets/manifesttestnet/images/mfx.png',
          svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/testnets/manifesttestnet/images/mfx.svg',
        },
      ],
    },
  ],
};

const assets = [manifestAssetList, osmosisAssetList];
const assetLists = [manifestAssetList, osmosisAssetList];

//TODO: use chain-registry when the package is updated
export const truncateDenom = (denom: string) => {
  return denom.slice(0, 10) + '...' + denom.slice(-6);
};

const filterAssets = (chainName: string, assetList: AssetList[]): Asset[] => {
  return (
    assetList
      .find(({ chain_name }) => chain_name === chainName)
      ?.assets?.filter(({ type_asset }) => type_asset === 'ics20' || !type_asset) || []
  );
};

const getAllAssets = (chainName: string) => {
  const nativeAssets = filterAssets(chainName, assets);
  const ibcAssets = filterAssets(chainName, assetLists);

  return [...nativeAssets, ...ibcAssets];
};

export const denomToAsset = (chainName: string, denom: string) => {
  const allAssets = getAllAssets(chainName);

  // Only handle IBC hashes
  if (denom.startsWith('ibc/')) {
    // Find the asset that has this IBC hash as its base
    const asset = allAssets.find(asset => asset.base === denom);
    if (asset?.traces?.[0]?.counterparty?.base_denom) {
      // Return the original denom from the counterparty chain
      return {
        ...asset,
        base: asset.traces[0].counterparty.base_denom,
      };
    }
  }

  // Return original asset if not an IBC hash
  return allAssets.find(asset => asset.base === denom);
};

export const denomToExponent = (chainName: string, denom: string) => {
  const asset = denomToAsset(chainName, denom);
  const unit = asset?.denom_units.find(({ denom }) => denom === asset.display);
  return unit?.exponent || 6;
};

export const prettyBalance = (chainName: string, balance: Coin) => {
  const { amount, denom } = balance;
  const asset = denomToAsset(chainName, denom);
  const symbol = asset?.symbol || truncateDenom(denom);
  const exponent = denomToExponent(chainName, denom);
  const displayAmount = shiftDigits(amount, -exponent);
  const logoUrl = Object.values(asset?.logo_URIs || {}).find(url => url);

  return { denom, symbol, amount, displayAmount, logoUrl, exponent };
};

export type PrettyBalance = ReturnType<typeof prettyBalance>;

export const mockIbcData: IBCInfo[] = [
  {
    $schema: '../../ibc_data.schema.json',
    chain_1: {
      chain_name: 'manifesttestnet',
      client_id: '07-tendermint-0',
      connection_id: 'connection-0',
    },
    chain_2: {
      chain_name: 'osmosistestnet',
      client_id: '07-tendermint-4314',
      connection_id: 'connection-3774',
    },
    channels: [
      {
        chain_1: {
          channel_id: 'channel-0',
          port_id: 'transfer',
        },
        chain_2: {
          channel_id: 'channel-10016',
          port_id: 'transfer',
        },
        ordering: 'unordered',
        version: 'ics20-1',
        tags: {
          status: 'live',
        },
      },
    ],
  },
];

export const getIbcInfo = (fromChainName: string, toChainName: string) => {
  let flipped = false;

  let ibcInfo = mockIbcData.find(
    i => i.chain_1.chain_name === fromChainName && i.chain_2.chain_name === toChainName
  );

  if (!ibcInfo) {
    ibcInfo = mockIbcData.find(
      i => i.chain_1.chain_name === toChainName && i.chain_2.chain_name === fromChainName
    );
    flipped = true;
  }

  if (!ibcInfo) {
    throw new Error('cannot find IBC info');
  }

  const key = flipped ? 'chain_2' : 'chain_1';
  const source_port = ibcInfo.channels[0][key].port_id;
  const source_channel = ibcInfo.channels[0][key].channel_id;

  return { source_port, source_channel };
};

export const getIbcDenom = (chainName: string, denom: string) => {
  const allAssets = getAllAssets(chainName);

  // Find the asset that has this denom as its counterparty base_denom
  const ibcAsset = allAssets.find(asset => asset.traces?.[0]?.counterparty?.base_denom === denom);

  // Return the IBC hash (base) if found
  return ibcAsset?.base;
};

export const normalizeIBCDenom = (chainName: string, denom: string) => {
  const asset = denomToAsset(chainName, denom);
  if (asset) {
    return {
      denom: asset.base,
    };
  }
  return { denom };
};

export type ResolvedIBCDenom = ReturnType<typeof normalizeIBCDenom>;
