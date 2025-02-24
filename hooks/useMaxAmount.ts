import { useCallback } from 'react';
import { CombinedBalanceInfo, isMfxToken } from '@/utils';
import { useFeeEstimation } from '@/hooks/useFeeEstimation';
import env from '@/config/env';

export function useEstimateMaxTokenAmount() {
  const { estimateFee } = useFeeEstimation(env.chain);

  return useCallback(
    async (address: string, selectedToken: CombinedBalanceInfo) => {
      const exponent = selectedToken.metadata?.denom_units[1]?.exponent ?? 6;
      const maxAmount = Number(selectedToken.amount) / Math.pow(10, exponent);

      let adjustedMaxAmount = maxAmount;
      if (isMfxToken(selectedToken.base)) {
        const fee = await estimateFee(address ?? '', []);
        adjustedMaxAmount = Math.max(0, maxAmount - fee.gas);
      }
      return adjustedMaxAmount;
    },
    [estimateFee]
  );
}
