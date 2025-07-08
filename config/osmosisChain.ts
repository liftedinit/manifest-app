import { AssetList, Chain, IBCInfo } from '@chain-registry/types';

import env from './env';

const buildType = env.chainTier;
let osmosisModule: {
  assets: AssetList;
  chain: Chain;
  ibc?: IBCInfo[];
};

if (buildType === 'qa') {
  osmosisModule = require('chain-registry/testnet/osmosistestnet');
} else if (buildType === 'testnet') {
  osmosisModule = require('chain-registry/testnet/osmosistestnet');
} else {
  osmosisModule = require('chain-registry/mainnet/osmosis');
}

let osmosisAssets: AssetList, osmosisChain: Chain, osmosisIbc: IBCInfo[];

if (buildType === 'qa') {
  const { assets, chain } = osmosisModule;
  osmosisAssets = assets;
  osmosisChain = chain;
  osmosisIbc = []; // Default value since devnet doesn't include ibc
} else if (buildType === 'testnet') {
  const { assets, chain, ibc } = osmosisModule;
  // Merge the ibcAssets into the osmosisAssets
  osmosisAssets = assets;
  osmosisChain = chain;
  osmosisIbc = ibc!;
} else {
  const { assets, chain, ibc } = osmosisModule;
  osmosisAssets = assets;
  osmosisChain = chain;
  osmosisIbc = ibc!;
}

export { osmosisAssets, osmosisChain, osmosisIbc };
