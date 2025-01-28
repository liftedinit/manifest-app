import { MintIcon } from '@/components/icons/MintIcon';
import { formatAmount, formatDenom, formatLargeNumber } from '@/utils';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgPayout } from '@liftedinit/manifestjs/dist/codegen/liftedinit/manifest/v1/tx';

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

registerHandler(MsgPayout.typeUrl, MsgPayoutHandler);
