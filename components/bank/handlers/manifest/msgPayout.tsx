import { MintIcon } from '@/components/icons/MintIcon';
import { formatAmount, formatDenom, formatLargeNumber } from '@/utils';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgPayout } from '@liftedinit/manifestjs/dist/codegen/liftedinit/manifest/v1/tx';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

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
    const receiver = (
      <TruncatedAddressWithCopy address={tx.metadata?.payoutPairs?.[0]?.address} slice={24} />
    );
    return tx.metadata?.payoutPairs?.length > 1 ? (
      <>You minted tokens to {tx.metadata?.payoutPairs?.length} addresses</>
    ) : (
      <span className="flex gap-1">
        You minted{' '}
        <span className="text-green-500">
          {amount} {denom}
        </span>{' '}
        to {receiver}
      </span>
    );
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
    const from = <TruncatedAddressWithCopy address={tx.sender} slice={24} />;
    return tx.metadata?.payoutPairs?.length > 1 ? (
      <span className="flex gap-1">You were minted tokens by {from}</span>
    ) : (
      <span className="flex gap-1">
        You were minted{' '}
        <span className="text-green-500">
          {amount} {denom}
        </span>{' '}
        by {from}
      </span>
    );
  },
});

registerHandler(MsgPayout.typeUrl, MsgPayoutHandler);
