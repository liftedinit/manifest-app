import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgUpdateGroupMembers } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';

export const MsgUpdateGroupMembersHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => <>You updated the members of group #{tx.metadata?.groupId}</>,
  failSender: 'You failed to update group members',
  successReceiver: tx => <>Group #{tx.metadata?.groupId} had its members updated</>,
});

registerHandler(MsgUpdateGroupMembers.typeUrl, MsgUpdateGroupMembersHandler);
