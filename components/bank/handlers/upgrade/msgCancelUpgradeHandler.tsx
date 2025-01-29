import { ArrowUpIcon } from '@/components/icons/ArrowUpIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgCancelUpgrade } from '@liftedinit/manifestjs/dist/codegen/cosmos/upgrade/v1beta1/tx';

export const MsgCancelUpgradeHandler = createSenderReceiverHandler({
  iconSender: ArrowUpIcon,
  successSender: 'You successfully cancelled the chain upgrade',
  failSender: 'You failed to cancel chain software upgrade',
  successReceiver: tx => (
    <>The chain software upgrade was cancelled by {tx.sender || 'an unknown address'}</>
  ),
});

registerHandler(MsgCancelUpgrade.typeUrl, MsgCancelUpgradeHandler);
