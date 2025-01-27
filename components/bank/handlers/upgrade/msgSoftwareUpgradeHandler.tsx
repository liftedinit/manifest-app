import { ArrowUpIcon } from '@/components/icons/ArrowUpIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgSoftwareUpgradeHandler = createSenderReceiverHandler({
  iconSender: ArrowUpIcon,
  successSender: tx =>
    `A chain upgrade to ${tx.metadata?.plan.name} is scheduled for block ${tx.metadata?.plan.height}`,
  failSender: tx => `You failed to schedule a chain software upgrade to ${tx.metadata?.plan.name}`,
  // The "receiver" scenario doesn't strictly apply if there's only a single actor,
  // so successReceiver is effectively the same message:
  successReceiver: tx =>
    `A chain upgrade to ${tx.metadata?.plan.name} is scheduled for block ${tx.metadata?.plan.height}`,
});
