import { BankIcon } from '@/components/icons/BankIcon';
import { formatAmount, formatDenom, formatLargeNumber } from '@/utils';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgSend } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/tx';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

export const MsgSendHandler = createSenderReceiverHandler({
  iconSender: BankIcon,
  successSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.[0]?.amount, tx.metadata?.amount?.[0]?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.[0]?.denom);
    const toAddress = tx.metadata?.toAddress ? (
      <TruncatedAddressWithCopy address={tx.metadata.toAddress} slice={24} />
    ) : (
      'an unknown address'
    );
    return (
      <span className="flex gap-1">
        You sent{' '}
        <span className="text-red-500">
          {' '}
          {amount} {denom}
        </span>{' '}
        to {toAddress}
      </span>
    );
  },
  failSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.[0]?.amount, tx.metadata?.amount?.[0]?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.[0]?.denom);
    const toAddress = tx.metadata?.toAddress ? (
      <TruncatedAddressWithCopy address={tx.metadata.toAddress} slice={24} />
    ) : (
      'an unknown address'
    );

    return (
      <span className="flex gap-1">
        You failed to send{' '}
        <span className="text-red-500">
          {amount} {denom}
        </span>{' '}
        to {toAddress}
      </span>
    );
  },
  successReceiver: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.[0]?.amount, tx.metadata?.amount?.[0]?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.[0]?.denom);
    const fromAddress = tx.sender ? (
      <TruncatedAddressWithCopy address={tx.sender} slice={24} />
    ) : (
      'an unknown address'
    );

    return (
      <span className="flex gap-1">
        You received{' '}
        <span className="text-green-500">
          {amount} {denom}
        </span>{' '}
        from {fromAddress}
      </span>
    );
  },
});

registerHandler(MsgSend.typeUrl, MsgSendHandler);
