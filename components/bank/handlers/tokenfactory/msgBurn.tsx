import { FactoryIcon } from '@/components/icons/FactoryIcon';
import { formatAmount, formatDenom, formatLargeNumber } from '@/utils';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgBurnHandler = createSenderReceiverHandler({
  iconSender: FactoryIcon,
  successSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.amount, tx.metadata?.amount?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.denom);
    const from = tx.metadata?.burnFromAddress;
    return `You burned <span class="text-red-500">${amount} ${denom}</span> from ${from}`;
  },
  failSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.amount, tx.metadata?.amount?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.denom);
    const from = tx.metadata?.burnFromAddress;
    return `You failed to burn <span class="text-red-500">${amount} ${denom}</span> from ${from}`;
  },
  successReceiver: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.amount, tx.metadata?.amount?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.denom);
    return `You were burned <span class="text-red-500">${amount} ${denom}</span> by ${tx.sender}`;
  },
});
