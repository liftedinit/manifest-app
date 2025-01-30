import { MsgMultiSend } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/tx';
import { createSenderReceiverHandler } from '@/components/bank/handlers/createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { BankIcon } from '@/components/icons/BankIcon';
import { format } from 'react-string-format';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { formatAmount, formatDenom, formatLargeNumber } from '@/utils';
import React from 'react';

const createMessage = (
  template: string,
  amount: string,
  denom: string,
  numReceivers: number,
  color: string,
  metadata?: MetadataSDKType[],
  sender?: string
) => {
  const formattedAmount = formatLargeNumber(formatAmount(amount, denom, metadata));
  const formattedDenom = formatDenom(denom);
  const coloredAmount = (
    <span className={`text-${color}-500`}>
      {formattedAmount} {formattedDenom}
    </span>
  );
  const coloredDenom = <span className={`text-${color}-500`}>{formattedDenom}</span>;
  const message = format(
    template,
    coloredAmount,
    numReceivers,
    coloredDenom,
    sender ? <TruncatedAddressWithCopy address={sender} slice={24} /> : 'an unknown address'
  );
  return <span className="flex gap-1">{message}</span>;
};

export const MsgMultiSendHandler = createSenderReceiverHandler({
  iconSender: BankIcon,
  successSender: (tx, _, metadata) => {
    return createMessage(
      'You sent {0} to {1} addresses',
      tx.metadata?.inputs?.[0]?.coins?.amount,
      tx.metadata?.inputs?.[0]?.coins?.denom,
      tx.metadata?.outputs?.length,
      'red',
      metadata
    );
  },
  failSender: (tx, _, metadata) => {
    return createMessage(
      'You failed to send {0} to {1} addresses',
      tx.metadata?.inputs?.[0]?.coins?.amount,
      tx.metadata?.inputs?.[0]?.coins?.denom,
      tx.metadata?.outputs?.length,
      'red',
      metadata
    );
  },
  successReceiver: (tx, _, metadata) => {
    return createMessage(
      'You received {2} tokens from {3}',
      tx.metadata?.inputs?.[0]?.coins?.amount,
      tx.metadata?.inputs?.[0]?.coins?.denom,
      tx.metadata?.outputs?.length,
      'green',
      metadata
    );
  },
});

registerHandler(MsgMultiSend.typeUrl, MsgMultiSendHandler);
