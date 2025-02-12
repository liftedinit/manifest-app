import env from './env';

const buildType = env.chainTier;
let manifestModule;

// TODO: Add mainnet manifest when it's available
if (buildType === 'devnet') {
  manifestModule = await import('chain-registry/devnet/manifestdevnet');
} else {
  manifestModule = await import('chain-registry/testnet/manifesttestnet');
}

export const { assets: manifestAssets, chain: manifestChain, ibc: manifestIbc } = manifestModule;
