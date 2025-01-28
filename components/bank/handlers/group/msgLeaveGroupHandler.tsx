import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgLeaveGroup } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';

export const MsgLeaveGroupHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: 'You left a group', // TODO: Group info?
  failSender: 'You failed to leave a group',
  successReceiver: 'Group had a member leave',
});

registerHandler(MsgLeaveGroup.typeUrl, MsgLeaveGroupHandler);
