import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgUpdateGroupPolicyDecisionPolicy } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';

export const MsgUpdateGroupPolicyDecisionPolicyHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx =>
    `You updated the decision policy of group ${tx.metadata?.groupPolicyAddress}`,
  failSender: tx =>
    `You failed to update the decision policy of group ${tx.metadata?.groupPolicyAddress}`,
  successReceiver: tx => `Group ${tx.metadata?.groupPolicyAddress} had its decision policy updated`,
});

registerHandler(
  MsgUpdateGroupPolicyDecisionPolicy.typeUrl,
  MsgUpdateGroupPolicyDecisionPolicyHandler
);
