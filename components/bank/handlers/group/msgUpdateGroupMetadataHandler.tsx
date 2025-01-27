import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgUpdateGroupMetadataHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => `You updated the metadata of group ${tx.sender}`, // TODO: Policy addr?
  failSender: tx => `You failed to update the metadata of group ${tx.sender}`,
  successReceiver: tx => `Group ${tx.sender} had its metadata updated`,
});
