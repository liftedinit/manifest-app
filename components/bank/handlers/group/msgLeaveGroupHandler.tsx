import { MsgLeaveGroup } from '@manifest-network/manifestjs/dist/codegen/cosmos/group/v1/tx';

import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { GroupsIcon } from '@/components/icons/GroupsIcon';

import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgLeaveGroupHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => `You left group #${tx.metadata?.groupId}`,
  failSender: tx => `You failed to leave group #${tx.metadata?.groupId}`,
  successReceiver: tx => `Group #${tx.metadata?.groupId} had a member leave`,
});

registerHandler(MsgLeaveGroup.typeUrl, MsgLeaveGroupHandler);
