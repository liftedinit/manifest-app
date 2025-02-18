import { ArrowUpIcon } from '@/components/icons/ArrowUpIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgSoftwareUpgrade } from '@liftedinit/manifestjs/dist/codegen/cosmos/upgrade/v1beta1/tx';
import { format } from 'react-string-format';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

const createMessage = (template: string, planName: string, planHeight: string, sender?: string) => {
  const message = format(
    template,
    planName,
    planHeight,
    sender ? <TruncatedAddressWithCopy address={sender} /> : 'an unknown address'
  );
  return <span className="flex gap-1">{message}</span>;
};

export const MsgSoftwareUpgradeHandler = createSenderReceiverHandler({
  iconSender: ArrowUpIcon,
  successSender: tx =>
    createMessage(
      'You scheduled a chain upgrade to {0} at block {1}',
      tx.metadata?.plan?.name,
      tx.metadata?.plan?.height
    ),
  failSender: tx =>
    createMessage(
      'You failed to schedule a chain software upgrade to {0} at block {1}',
      tx.metadata?.plan?.name,
      tx.metadata.plan?.height
    ),
  successReceiver: tx =>
    createMessage(
      'A chain upgrade to {0} is scheduled at block {1} by {2}',
      tx.metadata?.plan?.name,
      tx.metadata?.plan?.height,
      tx.sender
    ),
});

registerHandler(MsgSoftwareUpgrade.typeUrl, MsgSoftwareUpgradeHandler);
