import { BurnIcon } from '@/components/icons/BurnIcon';
import { formatAmount, formatDenom, formatLargeNumber } from '@/utils';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgBurnHeldBalance } from '@liftedinit/manifestjs/dist/codegen/liftedinit/manifest/v1/tx';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

export const MsgBurnHeldBalanceHandler = createSenderReceiverHandler({
  iconSender: BurnIcon,
  successSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(
        tx.metadata?.burnCoins?.[0]?.amount ?? '0',
        tx.metadata?.burnCoins?.[0]?.denom ?? 'unknown',
        metadata
      )
    );
    const denom = formatDenom(tx.metadata?.burnCoins?.[0]?.denom);
    const from = <TruncatedAddressWithCopy address={tx.sender} slice={24} />;
    return tx.metadata?.burnCoins?.length > 1 ? (
      <>You burned tokens from {tx.metadata?.burnCoins?.length} addresses</>
    ) : (
      <span className="flex gap-1">
        You burned{' '}
        <span className="text-red-500">
          {amount} {denom}
        </span>{' '}
        from {from}
      </span>
    );
  },
  failSender: 'You failed to burn tokens',
  successReceiver: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(
        tx.metadata?.burnCoins?.[0]?.amount ?? '0',
        tx.metadata?.burnCoins?.[0]?.denom ?? 'unknown',
        metadata
      )
    );
    const denom = formatDenom(tx.metadata?.burnCoins?.[0]?.denom);
    const from = <TruncatedAddressWithCopy address={tx.sender} slice={24} />;
    return tx.metadata?.burnCoins?.length > 1 ? (
      <span className="flex gap-1">You were burned tokens by {from}</span>
    ) : (
      <span className="flex gap-1">
        You were burned{' '}
        <span className="text-red-500">
          {amount} {denom}
        </span>{' '}
        by {from}
      </span>
    );
  },
});

registerHandler(MsgBurnHeldBalance.typeUrl, MsgBurnHeldBalanceHandler);
