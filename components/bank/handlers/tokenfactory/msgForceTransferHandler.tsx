import { FactoryIcon } from '@/components/icons/FactoryIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgForceTransfer } from '@liftedinit/manifestjs/dist/codegen/osmosis/tokenfactory/v1beta1/tx';
import React from 'react';
import { format } from 'react-string-format';
import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { formatAmount, formatDenom, formatLargeNumber } from '@/utils';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

const createMessage = (
  template: string,
  amount: string,
  denom: string,
  from: string,
  to: string,
  color: string,
  metadata?: MetadataSDKType[],
  sender?: string
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
    from ? <TruncatedAddressWithCopy address={from} slice={24} /> : 'an unknown address',
    to ? <TruncatedAddressWithCopy address={to} slice={24} /> : 'an unknown address',
    sender ? <TruncatedAddressWithCopy address={sender} slice={24} /> : 'an unknown address'
  );
  return <span className="flex gap-1">{message}</span>;
};

export const MsgForceTransferHandler = createSenderReceiverHandler({
  iconSender: FactoryIcon,
  successSender: (tx, _, metadata) =>
    createMessage(
      'You forced the transfer of {0} from {1} to {2}',
      tx.metadata?.amount?.amount,
      tx.metadata?.amount?.denom,
      tx.metadata?.transferFromAddress,
      tx.metadata?.transferToAddress,
      'gray',
      metadata
    ),
  failSender: (tx, _, metadata) =>
    createMessage(
      'You failed to force the transfer of {0} from {1} to {2}',
      tx.metadata?.amount?.amount,
      tx.metadata?.amount?.denom,
      tx.metadata?.transferFromAddress,
      tx.metadata?.transferToAddress,
      'gray',
      metadata
    ),
  successReceiver: (tx, _, metadata) =>
    createMessage(
      '{0} was force transferred from {1} to {2} by {3}',
      tx.metadata?.amount?.amount,
      tx.metadata?.amount?.denom,
      tx.metadata?.transferFromAddress,
      tx.metadata?.transferToAddress,
      'gray',
      metadata,
      tx.sender
    ),
});

registerHandler(MsgForceTransfer.typeUrl, MsgForceTransferHandler);
