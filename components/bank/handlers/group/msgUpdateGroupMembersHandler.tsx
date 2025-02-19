import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgUpdateGroupMembers } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';
import { format } from 'react-string-format';

const createMessage = (template: string, groupId: string) => {
  const message = format(template, groupId);
  return <span className="flex flex-wrap gap-1">{message}</span>;
};

export const MsgUpdateGroupMembersHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => createMessage('You updated the members of group #{0}', tx.metadata?.groupId),
  failSender: 'You failed to update group members',
  successReceiver: tx => createMessage('Group #{0} had its members updated', tx.metadata.groupId),
});

registerHandler(MsgUpdateGroupMembers.typeUrl, MsgUpdateGroupMembersHandler);
