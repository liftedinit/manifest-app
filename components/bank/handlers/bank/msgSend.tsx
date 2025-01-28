import { BankIcon } from '@/components/icons/BankIcon';
import { formatAmount, formatDenom, formatLargeNumber } from '@/utils';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgSendHandler = createSenderReceiverHandler({
  iconSender: BankIcon,
  successSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.[0]?.amount, tx.metadata?.amount?.[0]?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.[0]?.denom);
    const toAddress = tx.metadata?.toAddress;
    return `You sent <span class="text-red-500">${amount} ${denom}</span> to ${toAddress}`;
  },
  failSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.[0]?.amount, tx.metadata?.amount?.[0]?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.[0]?.denom);
    const toAddress = tx.metadata?.toAddress;

    return `You failed to send <span class="text-red-500">${amount} ${denom}</span> to ${toAddress}`;
  },
  successReceiver: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.[0]?.amount, tx.metadata?.amount?.[0]?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.[0]?.denom);
    const fromAddress = tx.sender;

    return `You received <span class="text-green-500">${amount} ${denom}</span> from ${fromAddress}`;
  },
});
