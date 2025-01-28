import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgUpdateGroupMembers } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';

export const MsgUpdateGroupMembersHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: 'You updated group members',
  failSender: 'You failed to upgrade group members',
  successReceiver: 'A group mentioning you had its members updated',
});

registerHandler(MsgUpdateGroupMembers.typeUrl, MsgUpdateGroupMembersHandler);
