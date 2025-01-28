import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgUpdateGroupPolicyMetadata } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';

export const MsgUpdateGroupPolicyMetadataHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx =>
    `You updated the policy metadata of group ${tx.metadata?.groupPolicyAddress}`,
  failSender: tx =>
    `You failed to update policy metadata of group ${tx.metadata?.groupPolicyAddress}`,
  successReceiver: tx => `Group ${tx.metadata?.groupPolicyAddress} had its policy metadata updated`,
});

registerHandler(MsgUpdateGroupPolicyMetadata.typeUrl, MsgUpdateGroupPolicyMetadataHandler);
