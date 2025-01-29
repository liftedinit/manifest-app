import { FactoryIcon } from '@/components/icons/FactoryIcon';
import { formatAmount, formatDenom, formatLargeNumber } from '@/utils';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgBurn } from '@liftedinit/manifestjs/dist/codegen/osmosis/tokenfactory/v1beta1/tx';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

export const MsgBurnHandler = createSenderReceiverHandler({
  iconSender: FactoryIcon,
  successSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.amount, tx.metadata?.amount?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.denom);
    const from = tx.metadata?.burnFromAddress ? (
      <TruncatedAddressWithCopy address={tx.metadata.burnFromAddress} slice={24} />
    ) : (
      'unknown'
    );
    return (
      <span className="flex gap-1">
        You burned{' '}
        <span className="text-red-500">
          {amount} {denom}
        </span>{' '}
        from {from}
      </span>
    );
  },
  failSender: (tx, _, metadata) => {
    const amount = formatLargeNumber(
      formatAmount(tx.metadata?.amount?.amount, tx.metadata?.amount?.denom, metadata)
    );
    const denom = formatDenom(tx.metadata?.amount?.denom);
    const from = tx.metadata?.burnFromAddress ? (
      <TruncatedAddressWithCopy address={tx.metadata.burnFromAddress} slice={24} />
    ) : (
      'unknown'
    );
    return (
      <span className="flex gap-1">
        You failed to burn{' '}
        <span className="text-red-500">
          {amount} {denom}
        </span>{' '}
        from {from}
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
      'unknown'
    );
    return (
      <span className="flex gap-1">
        You were burned{' '}
        <span className="text-red-500">
          {amount} {denom}
        </span>{' '}
        by {sender}
      </span>
    );
  },
});

registerHandler(MsgBurn.typeUrl, MsgBurnHandler);
