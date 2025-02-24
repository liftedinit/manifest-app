import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { TokenBase } from '@/utils/tokens';

export interface ExtendedMetadataSDKType extends MetadataSDKType {
  balance: string;
  totalSupply: string;
}

/**
 * Combined balance information with token metadata, in a normalized way.
 */
export type CombinedBalanceInfo = {
  /**
   * The display name of the token.
   */
  display: string;

  /**
   * The base denomination of the token.
   */
  base: TokenBase;

  /**
   * The token balance.
   */
  amount: string;

  /**
   * If available from the chain, the token metadata associated with
   * this balance info.
   */
  metadata: MetadataSDKType | null;
};

export type Contact = {
  name: string;
  address: string;
};
