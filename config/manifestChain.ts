import env from './env';
import { AssetList, Chain, IBCInfo } from '@chain-registry/types';

const buildType = env.chainTier;
let manifestModule: any;

// TODO: Add mainnet manifest when it's available
if (buildType === 'qa') {
  manifestModule = require('chain-registry/devnet/manifestdevnet');
} else {
  manifestModule = require('chain-registry/testnet/manifesttestnet');
}

let manifestAssets: AssetList, manifestChain: Chain, manifestIbc: IBCInfo[];

if (buildType === 'qa') {
  const { assets, chain } = manifestModule;
  manifestAssets = assets;
  manifestChain = chain;
  manifestIbc = []; // Default value since devnet doesn't include ibc
} else {
  const { assets, chain, ibc } = manifestModule;
  manifestAssets = assets;
  manifestChain = chain;
  manifestIbc = ibc;
}

export { manifestAssets, manifestChain, manifestIbc };
