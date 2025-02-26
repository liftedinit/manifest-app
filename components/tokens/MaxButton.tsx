import React from 'react';

import { MFX_FEES_CONSTANT, useEstimateMaxTokenAmount } from '@/hooks';
import { CombinedBalanceInfo, isMfxToken } from '@/utils';

export interface MaxButtonProps {
  token: CombinedBalanceInfo | null;
  setTokenAmount: (amount: string) => void;
  disabled?: boolean;
}

export const MaxButton = ({ token, setTokenAmount, disabled }: MaxButtonProps) => {
  const estimateMax = useEstimateMaxTokenAmount();

  return (
    <button
      disabled={disabled}
      type="button"
      onClick={async () => {
        if (!token) return;

        const amount = estimateMax(token);
        const decimals = token.metadata?.denom_units[1]?.exponent ?? 6;
        const formattedAmount = amount.toFixed(decimals).replace(/\.?0+$/, '');

        setTokenAmount(formattedAmount);
      }}
    >
      <div className="tooltip tooltip-primary">
        <span className="text-xs text-primary">MAX</span>
      </div>
      {token && isMfxToken(token.base) && (
        <div
          className="tooltip tooltip-primary"
          data-tip="The fees are an estimate and calculated when sending"
        >
          <span className="text-xs text-primary">(-{MFX_FEES_CONSTANT} MFX fees estimated)</span>
        </div>
      )}
    </button>
  );
};
