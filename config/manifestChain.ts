import { AssetList, Chain, IBCInfo } from '@chain-registry/types';

import env from './env';

const buildType = env.chainTier;
let manifestModule: {
  assets: AssetList;
  chain: Chain;
  ibc?: IBCInfo[];
};

// TODO: Add mainnet manifest when it's available

if (buildType === 'qa') {
  manifestModule = require('chain-registry/devnet/manifestdevnet');
} else {
  manifestModule = require('chain-registry/testnet/manifesttestnet');
}

let manifestAssets: AssetList, manifestChain: Chain, manifestIbc: IBCInfo[];

// Define IBC assets for Osmosis and Axelar
const ibcAssets: AssetList = {
  chain_name: 'manifesttestnet',
  assets: [
    {
      description: 'Osmosis token on Manifest Ledger Testnet',
      denom_units: [
        {
          denom: 'ibc/D24B4564BCD51D3D02D9987D92571EAC5915676A9BD6D9B0C1D0254CB8A5EA34',
          exponent: 0,
        },
        {
          denom: 'osmo',
          exponent: 6,
        },
      ],
      type_asset: 'ics20',
      base: 'ibc/D24B4564BCD51D3D02D9987D92571EAC5915676A9BD6D9B0C1D0254CB8A5EA34',
      name: 'Osmosis',
      display: 'osmo',
      symbol: 'OSMO',
      traces: [
        {
          type: 'ibc',
          counterparty: {
            chain_name: 'osmosistestnet',
            base_denom: 'uosmo',
            channel_id: 'channel-10183',
          },
          chain: {
            channel_id: 'channel-5',
            path: 'transfer/channel-5/uosmo',
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
      coingecko_id: 'osmosis',
    },
    {
      description: 'Axelar token on Manifest Ledger Testnet',
      denom_units: [
        {
          denom: 'ibc/3E35008738AC049C9C1A1E37F785E947A8DAA9811B3EA3B25580664294056151',
          exponent: 0,
        },
        {
          denom: 'axl',
          exponent: 6,
        },
      ],
      type_asset: 'ics20',
      base: 'ibc/3E35008738AC049C9C1A1E37F785E947A8DAA9811B3EA3B25580664294056151',
      name: 'Axelar',
      display: 'axl',
      symbol: 'AXL',
      traces: [
        {
          type: 'ibc',
          counterparty: {
            chain_name: 'axelartestnet',
            base_denom: 'uaxl',
            channel_id: 'channel-594',
          },
          chain: {
            channel_id: 'channel-6',
            path: 'transfer/channel-6/uaxl',
          },
        },
      ],
      images: [
        {
          image_sync: {
            chain_name: 'axelartestnet',
            base_denom: 'uaxl',
          },
          png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/axl.png',
          svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/axl.svg',
        },
      ],
      logo_URIs: {
        png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/axl.png',
        svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/axl.svg',
      },
      coingecko_id: 'axelar',
    },
  ],
};

if (buildType === 'qa') {
  const { assets, chain } = manifestModule;
  manifestAssets = assets;
  manifestChain = chain;
  manifestIbc = []; // Default value since devnet doesn't include ibc
} else {
  const { assets, chain, ibc } = manifestModule;
  // Merge the ibcAssets into the manifestAssets
  manifestAssets = {
    ...assets,
    assets: [...assets.assets, ...ibcAssets.assets],
  };
  manifestChain = chain;
  manifestIbc = ibc!;
}

export { manifestAssets, manifestChain, manifestIbc };
