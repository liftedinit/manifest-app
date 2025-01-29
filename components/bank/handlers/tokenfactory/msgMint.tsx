import { FactoryIcon } from '@/components/icons/FactoryIcon';
import { formatAmount, formatDenom, formatLargeNumber } from '@/utils';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgMint } from '@liftedinit/manifestjs/dist/codegen/osmosis/tokenfactory/v1beta1/tx';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

export const MsgMintHandler = createSenderReceiverHandler({
  iconSender: FactoryIcon,
  successSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.amount, tx.metadata?.amount?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.denom);
    const mintToAddress = tx.metadata?.mintToAddress ? (
      <TruncatedAddressWithCopy address={tx.metadata.mintToAddress} slice={24} />
    ) : (
      'an unknown address'
    );
    return (
      <span className="flex gap-1">
        You minted{' '}
        <span className="text-green-500">
          {amount} {denom}
        </span>{' '}
        to {mintToAddress}
      </span>
    );
  },
  failSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.amount, tx.metadata?.amount?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.denom);
    const mintToAddress = tx.metadata?.mintToAddress ? (
      <TruncatedAddressWithCopy address={tx.metadata.mintToAddress} slice={24} />
    ) : (
      'an unknown address'
    );
    return (
      <span className="flex gap-1">
        You failed to mint{' '}
        <span className="text-red-500">
          {amount} {denom}
        </span>{' '}
        to {mintToAddress}
      </span>
    );
  },
  successReceiver: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.amount, tx.metadata?.amount?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.denom);
    const sender = tx.sender ? (
      <TruncatedAddressWithCopy address={tx.sender} slice={24} />
    ) : (
      'an unknown address'
    );
    return (
      <span className="flex gap-1">
        You were minted{' '}
        <span className="text-green-500">
          {amount} {denom}
        </span>{' '}
        from {sender}
      </span>
    );
  },
});

registerHandler(MsgMint.typeUrl, MsgMintHandler);
