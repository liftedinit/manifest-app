import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';

export interface ExtendedMetadataSDKType extends MetadataSDKType {
  balance: string;
  totalSupply: string;
}

export type CombinedBalanceInfo = {
  denom: string;
  coreDenom: string;
  amount: string;
  metadata: MetadataSDKType | null;
};

export type Contact = {
  name: string;
  address: string;
};
