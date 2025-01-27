import { formatAmount, formatDenom } from '@/components';
import { MintIcon } from '@/components/icons/MintIcon';
import { formatLargeNumber } from '@/utils';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgPayoutHandler = createSenderReceiverHandler({
  iconSender: MintIcon,
  successSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(
        tx.metadata?.payoutPairs?.[0]?.coin?.amount,
        tx.metadata?.payoutPairs?.[0]?.coin?.denom,
        metadata
      )
    );
    const denom = formatDenom(tx.metadata?.payoutPairs?.[0]?.coin?.denom);
    return tx.metadata?.payoutPairs?.length > 1
      ? `You minted tokens to ${tx.metadata?.payoutPairs?.length} addresses`
      : `You minted <span class="text-green-500">${amount} ${denom}</span> to ${tx.metadata?.payoutPairs?.[0]?.address}`;
  },
  failSender: 'You failed to mint tokens',
  successReceiver: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(
        tx.metadata?.payoutPairs?.[0]?.coin?.amount,
        tx.metadata?.payoutPairs?.[0]?.coin?.denom,
        metadata
      )
    );
    const denom = formatDenom(tx.metadata?.payoutPairs?.[0]?.coin?.denom);
    return tx.metadata?.payoutPairs?.length > 1
      ? `You were minted tokens by ${tx.sender}`
      : `you were minted <span class="text-green-500">${amount} ${denom}</span> by ${tx.sender}`;
  },
});
