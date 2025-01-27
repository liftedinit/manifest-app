import { formatAmount, formatDenom } from '@/components';
import { TransferIcon } from '@/components/icons/TransferIcon';
import { formatLargeNumber } from '@/utils';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgTransferHandler = createSenderReceiverHandler({
  iconSender: TransferIcon,
  successSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.token?.amount, tx.metadata?.token?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.token?.denom);
    const receiver = tx.metadata?.receiver;
    return `You sent <span class="text-red-500">${amount} ${denom}</span> to ${receiver} via IBC`;
  },
  failSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.token?.amount, tx.metadata?.token?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.token?.denom);
    const receiver = tx.metadata?.receiver;
    return `You failed to send <span class="text-red-500">${amount} ${denom}</span> to ${receiver} via IBC`;
  },
  successReceiver: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.token?.amount, tx.metadata?.token?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.token?.denom);
    const sender = tx.sender;
    return `You received <span class="text-green-500">${amount} ${denom}</span> from ${sender} via IBC`;
  },
});
