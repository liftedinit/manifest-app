import { BurnIcon } from '@/components/icons/BurnIcon';
import { formatAmount, formatDenom, formatLargeNumber } from '@/utils';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgBurnHeldBalance } from '@liftedinit/manifestjs/dist/codegen/liftedinit/manifest/v1/tx';

export const MsgBurnHeldBalanceHandler = createSenderReceiverHandler({
  iconSender: BurnIcon,
  successSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(
        tx.metadata?.burnCoins?.[0]?.amount,
        tx.metadata?.burnCoins?.[0]?.denom,
        metadata
      )
    );
    const denom = formatDenom(tx.metadata?.burnCoins?.[0]?.denom);
    const from = tx.sender;
    return tx.metadata?.burnCoins?.length > 1
      ? `You burned tokens from ${tx.metadata?.burnCoins?.length} addresses`
      : `You burned <span class="text-red-500">${amount} ${denom}</span> from ${from}`;
  },
  failSender: 'You failed to burn tokens',
  successReceiver: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(
        tx.metadata?.burnCoins?.[0]?.amount,
        tx.metadata?.burnCoins?.[0]?.denom,
        metadata
      )
    );
    const denom = formatDenom(tx.metadata?.burnCoins?.[0]?.denom);
    return tx.metadata?.burnCoins?.length > 1
      ? `You were burned tokens by ${tx.sender}`
      : `You were burned <span class="text-red-500">${amount} ${denom}</span> by ${tx.sender}`;
  },
});

registerHandler(MsgBurnHeldBalance.typeUrl, MsgBurnHeldBalanceHandler);
