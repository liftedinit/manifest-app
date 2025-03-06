import BigNumber from 'bignumber.js';
import React from 'react';

import { DenomDisplay } from '@/components';
import { CombinedBalanceInfo, formatLargeNumber, shiftDigits, truncateString } from '@/utils';

export interface TokenBalanceProps {
  token: CombinedBalanceInfo;
  denom?: string | null;
}

/**
 * Display the token balance, handling very large amounts of tokens.
 * @param token
 * @param denom
 * @constructor
 */
export const TokenBalance = ({ token, denom }: TokenBalanceProps) => {
  const units = token.metadata?.denom_units;
  const denomUnit = units?.[units.length - 1];
  const exponent = denomUnit?.exponent ?? 6;
  denom = (denom ?? denomUnit?.denom ?? token.display).toUpperCase();

  const [balance, tooltipAmount] = React.useMemo(() => {
    const amount = shiftDigits(token.amount ?? 0, -exponent);
    const amountBN = new BigNumber(amount);
    const balance = formatLargeNumber(Number(amount));

    const int = BigInt(amountBN.integerValue(BigNumber.ROUND_DOWN).toFixed(0));
    const dec = amountBN.minus(int.toString()).toNumber();
    const tooltipAmount = `${int.toLocaleString()}${dec ? ('' + dec).replace(/^0\./, '.') : ''}`;

    return [balance, tooltipAmount];
  }, [token.amount, exponent]);

  return (
    <span className="inline-block tooltip token-amount" data-tip={tooltipAmount + ' ' + denom}>
      {balance} <DenomDisplay image={false} denom={denom} />
    </span>
  );
};
