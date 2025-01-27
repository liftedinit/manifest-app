import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgUpdateGroupMembersHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: 'You updated group members',
  failSender: 'You failed to upgrade group members',
  successReceiver: 'A group mentioning you had its members updated',
});
