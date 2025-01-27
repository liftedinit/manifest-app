import { formatAmount, formatDenom } from '@/components';
import { BurnIcon } from '@/components/icons/BurnIcon';
import { formatLargeNumber } from '@/utils';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgBurnHeldBalanceHandler = createSenderReceiverHandler({
  iconSender: BurnIcon,
  successSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.amount, tx.metadata?.amount?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.denom);
    const from = tx.metadata?.burnFromAddress;
    return tx.metadata?.burnCoins?.length > 1
      ? `You burned tokens from ${tx.metadata?.burnCoins?.length} addresses`
      : `You burned <span class="text-red-500">${amount} ${denom}</span> from ${from}`;
  },
  failSender: 'You failed to burn tokens',
  successReceiver: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.burnCoins[0]?.amount, tx.metadata?.burnCoins[0]?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.burnCoins[0]?.denom);
    return tx.metadata?.burnCoins?.length > 1
      ? `You were burned tokens by ${tx.sender}`
      : `You were burned <span class="text-red-500">${amount} ${denom}</span> by ${tx.sender}`;
  },
});
