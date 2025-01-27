import { formatAmount, formatDenom } from '@/components';
import { FactoryIcon } from '@/components/icons/FactoryIcon';
import { formatLargeNumber } from '@/utils';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgMintHandler = createSenderReceiverHandler({
  iconSender: FactoryIcon,
  successSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.amount, tx.metadata?.amount?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.denom);
    const mintToAddress = tx.metadata?.mintToAddress;
    return `You minted <span class="text-green-500">${amount} ${denom}</span> to ${mintToAddress}`;
  },
  failSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.amount, tx.metadata?.amount?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.denom);
    const mintToAddress = tx.metadata?.mintToAddress;
    return `You failed to mint <span class="text-red-500">${amount} ${denom}</span> to ${mintToAddress}`;
  },
  successReceiver: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.amount, tx.metadata?.amount?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.denom);
    return `You were minted <span class="text-green-500">${amount} ${denom}</span> from ${tx.sender}`;
  },
});
