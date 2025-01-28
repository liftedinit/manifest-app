import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgCreateGroupWithPolicy } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';

export const MsgCreateGroupWithPolicyHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: 'You created a new group',
  failSender: 'You failed to create a new group',
  successReceiver: 'A new group mentioning you was created',
});

registerHandler(MsgCreateGroupWithPolicy.typeUrl, MsgCreateGroupWithPolicyHandler);
