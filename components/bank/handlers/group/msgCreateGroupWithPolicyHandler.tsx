import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgCreateGroupWithPolicyHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: 'You created a new group',
  failSender: 'You failed to create a new group',
  successReceiver: 'A new group mentioning you was created',
});
