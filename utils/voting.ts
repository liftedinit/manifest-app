import { AssetList } from '@chain-registry/types';
import { assets } from 'chain-registry';

export const decodeUint8Arr = (uint8array: Uint8Array | undefined) => {
  if (!uint8array) return '';
  return new TextDecoder('utf-8').decode(uint8array);
};
export const getChainAssets = (chainName: string) => {
  return assets.find(chain => chain.chain_name === chainName) as AssetList;
};

export const getCoin = (chainName: string) => {
  const chainAssets = getChainAssets(chainName);
  return chainAssets?.assets[0];
};
