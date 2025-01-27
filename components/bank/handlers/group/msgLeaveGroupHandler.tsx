import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgLeaveGroupHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: 'You left a group', // TODO: Group info?
  failSender: 'You failed to leave a group',
  successReceiver: 'Group had a member leave',
});
