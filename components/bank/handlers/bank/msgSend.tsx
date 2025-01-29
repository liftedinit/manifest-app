import { BankIcon } from '@/components/icons/BankIcon';
import { formatAmount, formatDenom, formatLargeNumber } from '@/utils';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgSend } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/tx';

export const MsgSendHandler = createSenderReceiverHandler({
  iconSender: BankIcon,
  successSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.[0]?.amount, tx.metadata?.amount?.[0]?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.[0]?.denom);
    const toAddress = tx.metadata?.toAddress ?? 'an unknown address';
    return (
      <>
        You sent{' '}
        <span className="text-red-500">
          {amount} {denom}
        </span>{' '}
        to {toAddress}
      </>
    );
  },
  failSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.[0]?.amount, tx.metadata?.amount?.[0]?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.[0]?.denom);
    const toAddress = tx.metadata?.toAddress ?? 'an unknown address';

    return (
      <>
        You failed to send{' '}
        <span className="text-red-500">
          {amount} {denom}
        </span>{' '}
        to {toAddress}
      </>
    );
  },
  successReceiver: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.[0]?.amount, tx.metadata?.amount?.[0]?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.[0]?.denom);
    const fromAddress = tx.sender ?? 'an unknown address';

    return (
      <>
        You received{' '}
        <span className="text-green-500">
          {amount} {denom}
        </span>{' '}
        from {fromAddress}
      </>
    );
  },
});

registerHandler(MsgSend.typeUrl, MsgSendHandler);
