import { ArrowUpIcon } from '@/components/icons/ArrowUpIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgCancelUpgrade } from '@liftedinit/manifestjs/dist/codegen/cosmos/upgrade/v1beta1/tx';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { format } from 'react-string-format';

const createMessage = (template: string, sender: string) => {
  const message = format(
    template,
    sender ? <TruncatedAddressWithCopy address={sender} /> : 'an unknown address'
  );
  return <span className="flex gap-1">{message}</span>;
};

export const MsgCancelUpgradeHandler = createSenderReceiverHandler({
  iconSender: ArrowUpIcon,
  successSender: 'You successfully cancelled the chain upgrade',
  failSender: 'You failed to cancel chain software upgrade',
  successReceiver: tx =>
    createMessage('The chain software upgrade was cancelled by {0}', tx.sender),
});

registerHandler(MsgCancelUpgrade.typeUrl, MsgCancelUpgradeHandler);
