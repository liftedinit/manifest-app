import BigNumber from 'bignumber.js';

import { CombinedBalanceInfo, isMfxToken } from '@/utils';

/**
 * The constant fee for the UMFX token.
 */
export const MFX_FEES_CONSTANT = 0.1;

/**
 * Hook to estimate the maximum token amount that can be sent.
 */
export function useEstimateMaxTokenAmount() {
  return (selectedToken: CombinedBalanceInfo): BigNumber => {
    const exponent = selectedToken.metadata?.denom_units[1]?.exponent ?? 6;
    const maxAmount = new BigNumber(selectedToken.amount).div(Math.pow(10, exponent));

    let adjustedMaxAmount = maxAmount;
    if (isMfxToken(selectedToken.base)) {
      if (maxAmount.gt(MFX_FEES_CONSTANT)) {
        adjustedMaxAmount = maxAmount.minus(MFX_FEES_CONSTANT);
      } else {
        adjustedMaxAmount = new BigNumber(0);
      }
    }
    return adjustedMaxAmount;
  };
}
