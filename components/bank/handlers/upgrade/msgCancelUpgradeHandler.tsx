import { ArrowUpIcon } from '@/components/icons/ArrowUpIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgCancelUpgrade } from '@liftedinit/manifestjs/dist/codegen/cosmos/upgrade/v1beta1/tx';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

export const MsgCancelUpgradeHandler = createSenderReceiverHandler({
  iconSender: ArrowUpIcon,
  successSender: 'You successfully cancelled the chain upgrade',
  failSender: 'You failed to cancel chain software upgrade',
  successReceiver: tx => {
    const sender = tx.sender ? (
      <TruncatedAddressWithCopy address={tx.sender} slice={24} />
    ) : (
      'an unknown address'
    );
    return <span className="flex gap-1">The chain software upgrade was cancelled by {sender}</span>;
  },
});

registerHandler(MsgCancelUpgrade.typeUrl, MsgCancelUpgradeHandler);
