import React from 'react';

import { DenomDisplay } from '@/components';
import { CombinedBalanceInfo, formatLargeNumber, shiftDigits, truncateString } from '@/utils';

export interface TokenBalanceProps {
  token: CombinedBalanceInfo;
}

/**
 * Display the token balance, handling very large amounts of tokens.
 * @param token
 * @constructor
 */
export const TokenBalance = ({ token }: TokenBalanceProps) => {
  const units = token.metadata?.denom_units;
  const denomUnit = units?.[units.length - 1];
  const exponent = denomUnit?.exponent ?? 6;
  const denom = (denomUnit?.denom ?? token.display).toUpperCase();

  const balance = formatLargeNumber(Number(shiftDigits(Number(token.amount ?? 0), -exponent)));

  return (
    <>
      <span className="inline-block">
        {balance} <DenomDisplay image={false} denom={denom} />
      </span>
    </>
  );
};
