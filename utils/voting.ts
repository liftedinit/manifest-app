import { AssetList } from '@chain-registry/types';
import { assets } from 'chain-registry';
import {
  VoteOption,
  voteOptionFromJSON,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';

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

export const formatVote = (vote: string) => {
  switch (voteOptionFromJSON(vote)) {
    case VoteOption.VOTE_OPTION_YES:
      return 'YES';
    case VoteOption.VOTE_OPTION_NO:
      return 'NO';
    case VoteOption.VOTE_OPTION_ABSTAIN:
      return 'ABSTAIN';
    case VoteOption.VOTE_OPTION_NO_WITH_VETO:
      return 'NO WITH VETO';
    default:
      return 'UNKNOWN';
  }
};
