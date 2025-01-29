import React from 'react';
import { formatAmount, formatDenom, formatLargeNumber } from '@/utils';
import { format } from 'react-string-format';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';

export const createTokenMessage = (
  template: string,
  amount: string,
  denom: string,
  address: string,
  color: string,
  metadata?: MetadataSDKType[]
) => {
  const formattedAmount = formatLargeNumber(formatAmount(amount, denom, metadata));
  const formattedDenom = formatDenom(denom);
  // coloredAmount is {0}
  const coloredAmount = (
    <span className={`text-${color}-500`}>
      {formattedAmount} {formattedDenom}
    </span>
  );
  const message = format(
    template,
    coloredAmount,
    address ? <TruncatedAddressWithCopy address={address} slice={24} /> : 'an unknown address'
  );
  return <span className="flex gap-1">{message}</span>;
};

export const createValidatorMessage = (
  template: string,
  validatorAddress: string,
  sender?: string
) => {
  const message = format(
    template,
    validatorAddress ? (
      <TruncatedAddressWithCopy address={validatorAddress} slice={24} />
    ) : (
      'unknown'
    ),
    sender ? <TruncatedAddressWithCopy address={sender} slice={24} /> : 'an unknown address'
  );
  return <span className="flex gap-1">{message}</span>;
};
