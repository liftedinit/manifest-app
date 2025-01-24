import { shiftDigits } from '@/utils';
import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';

export * from './sendBox';
export * from './tokenList';
export * from './historyBox';

export function formatDenom(denom: string): string {
  const cleanDenom = denom.replace(/^factory\/[^/]+\//, '');

  if (cleanDenom.startsWith('u')) {
    return cleanDenom.slice(1).toUpperCase();
  }

  return cleanDenom;
}

export function formatAmount(amount: string, denom: string, metadata?: MetadataSDKType[]) {
  const meta = metadata?.find(m => m.base === denom);
  const exponent = Number(meta?.denom_units[1]?.exponent) || 6;
  return Number(shiftDigits(amount, -exponent));
}
