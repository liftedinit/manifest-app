import React from 'react';

import { HelpIcon } from '@/components';
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
      className="text-xs text-primary cursor-pointer"
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
      MAX
      {token && isMfxToken(token.base) && (
        <span
          className="tooltip tooltip-primary align-baseline"
          data-tip={`-${MFX_FEES_CONSTANT} MFX fees estimated`}
        >
          <HelpIcon role="contentinfo" aria-label="info" className="w-3 h-3 ml-1 text-primary" />
        </span>
      )}
    </button>
  );
};
