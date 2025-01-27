import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgUpdateGroupPolicyDecisionPolicyHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx =>
    `You updated the decision policy of group ${tx.metadata?.groupPolicyAddress}`,
  failSender: tx =>
    `You failed to update the decision policy of group ${tx.metadata?.groupPolicyAddress}`,
  successReceiver: tx => `Group ${tx.metadata?.groupPolicyAddress} had its decision policy updated`,
});
