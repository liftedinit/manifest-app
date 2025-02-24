import { CombinedBalanceInfo, isMfxToken } from '@/utils';

/**
 * The constant fee for the UMFX token.
 */
export const MFX_FEES_CONSTANT = 0.1;

/**
 * Hook to estimate the maximum token amount that can be sent.
 */
export function useEstimateMaxTokenAmount() {
  return (selectedToken: CombinedBalanceInfo) => {
    const exponent = selectedToken.metadata?.denom_units[1]?.exponent ?? 6;
    const maxAmount = Number(selectedToken.amount) / Math.pow(10, exponent);

    let adjustedMaxAmount = maxAmount;
    if (isMfxToken(selectedToken.base)) {
      adjustedMaxAmount = Math.max(0, maxAmount - MFX_FEES_CONSTANT);
    }
    return adjustedMaxAmount;
  };
}
