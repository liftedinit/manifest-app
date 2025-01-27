import { ArrowUpIcon } from '@/components/icons/ArrowUpIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgCancelUpgradeHandler = createSenderReceiverHandler({
  iconSender: ArrowUpIcon,
  successSender: 'You successfully cancelled the chain upgrade',
  failSender: 'You failed to cancel chain software upgrade',
  successReceiver: tx => `The chain software upgrade was cancelled by ${tx.sender}`,
});
