import React from 'react';
import { formatAmount, formatDenomWithBadge, formatLargeNumber } from '@/utils';
import { format } from 'react-string-format';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { CoinSDKType } from '@liftedinit/manifestjs/src/codegen/cosmos/base/v1beta1/coin';

export const createTokenMessage = (
  template: string,
  amounts: CoinSDKType[],
  address: string,
  color: string,
  metadata?: MetadataSDKType[]
) => {
  let allAmountDenom: React.ReactNode[] = [];
  amounts?.forEach(coin => {
    const amount = coin.amount;
    const denom = coin.denom;
    const formattedAmount = formatLargeNumber(formatAmount(amount, denom, metadata));
    const formattedDenom = formatDenomWithBadge(denom);
    allAmountDenom.push(
      <span key={coin.denom}>
        {formattedAmount} {formattedDenom}
      </span>
    );
  });

  let displayAmountDenom: React.ReactNode;
  if (allAmountDenom.length > 2) {
    displayAmountDenom = (
      <>
        {allAmountDenom[0]}, {allAmountDenom[allAmountDenom.length - 1]} and{' '}
        {allAmountDenom.length - 2} more denomination(s)
      </>
    );
  } else {
    displayAmountDenom = allAmountDenom.map((elem, i) => (
      <React.Fragment key={i}>
        {elem}
        {i < allAmountDenom.length - 1 && ', '}
      </React.Fragment>
    ));
  }

  const coloredAmountDenom = <span className={`text-${color}-500`}>{displayAmountDenom}</span>;
  const message = format(
    template,
    coloredAmountDenom,
    address ? <TruncatedAddressWithCopy address={address} /> : 'an unknown address'
  );
  return <span className="flex flex-wrap gap-1">{message}</span>;
};

export const createValidatorMessage = (
  template: string,
  validatorAddress: string,
  sender?: string
) => {
  const message = format(
    template,
    validatorAddress ? <TruncatedAddressWithCopy address={validatorAddress} /> : 'unknown',
    sender ? <TruncatedAddressWithCopy address={sender} /> : 'an unknown address'
  );
  return <span className="flex flex-wrap gap-1">{message}</span>;
};
