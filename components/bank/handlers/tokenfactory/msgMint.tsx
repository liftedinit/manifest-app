import { FactoryIcon } from '@/components/icons/FactoryIcon';
import { formatAmount, formatDenom, formatLargeNumber } from '@/utils';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgMint } from '@liftedinit/manifestjs/dist/codegen/osmosis/tokenfactory/v1beta1/tx';

export const MsgMintHandler = createSenderReceiverHandler({
  iconSender: FactoryIcon,
  successSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.amount, tx.metadata?.amount?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.denom);
    const mintToAddress = tx.metadata?.mintToAddress;
    return (
      <>
        You minted{' '}
        <span className="text-green-500">
          {amount} {denom}
        </span>{' '}
        to {mintToAddress}
      </>
    );
  },
  failSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.amount, tx.metadata?.amount?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.denom);
    const mintToAddress = tx.metadata?.mintToAddress;
    return (
      <>
        You failed to mint{' '}
        <span className="text-red-500">
          {amount} {denom}
        </span>{' '}
        to {mintToAddress}
      </>
    );
  },
  successReceiver: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.amount, tx.metadata?.amount?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.denom);
    return (
      <>
        You were minted{' '}
        <span className="text-green-500">
          {amount} {denom}
        </span>{' '}
        from {tx.sender}
      </>
    );
  },
});

registerHandler(MsgMint.typeUrl, MsgMintHandler);
