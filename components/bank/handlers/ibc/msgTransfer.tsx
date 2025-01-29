import { TransferIcon } from '@/components/icons/TransferIcon';
import { formatAmount, formatDenom, formatLargeNumber } from '@/utils';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgTransfer } from '@liftedinit/manifestjs/dist/codegen/ibc/applications/transfer/v1/tx';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

export const MsgTransferHandler = createSenderReceiverHandler({
  iconSender: TransferIcon,
  successSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.token?.amount, tx.metadata?.token?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.token?.denom);
    const receiver = tx.metadata?.receiver ? (
      <TruncatedAddressWithCopy address={tx.metadata.receiver} slice={24} />
    ) : (
      'unknown'
    );
    return (
      <span className="flex gap-1">
        You sent{' '}
        <span className="text-red-500">
          {amount} {denom}
        </span>{' '}
        to {receiver} via IBC
      </span>
    );
  },
  failSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.token?.amount, tx.metadata?.token?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.token?.denom);
    const receiver = tx.metadata?.receiver ? (
      <TruncatedAddressWithCopy address={tx.metadata.receiver} slice={24} />
    ) : (
      'unknown'
    );
    return (
      <span className="flex gap-1">
        You failed to send{' '}
        <span className="text-red-500">
          {amount} {denom}
        </span>{' '}
        to {receiver} via IBC
      </span>
    );
  },
  successReceiver: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.token?.amount, tx.metadata?.token?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.token?.denom);
    const sender = <TruncatedAddressWithCopy address={tx.sender} slice={24} />;
    return (
      <span className="flex gap-1">
        You received{' '}
        <span className="text-green-500">
          {amount} {denom}
        </span>{' '}
        from {sender} via IBC
      </span>
    );
  },
});

registerHandler(MsgTransfer.typeUrl, MsgTransferHandler);
