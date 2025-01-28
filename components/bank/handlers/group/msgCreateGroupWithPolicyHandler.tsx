import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgCreateGroupWithPolicy } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';
import { getGroupTitle } from '@/components/bank/handlers/group/metadata';

export const MsgCreateGroupWithPolicyHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => {
    const metadata = tx.metadata?.groupMetadata;
    const title = getGroupTitle(metadata);
    return title ? `You created a new group named "${title}"` : 'You created a new group';
  },
  failSender: 'You failed to create a new group',
  successReceiver: tx => {
    const metadata = tx.metadata?.groupMetadata;
    const title = getGroupTitle(metadata);
    return title
      ? `You were mentioned in a new group named "${title}"`
      : 'You were mentioned in a new group';
  },
});

registerHandler(MsgCreateGroupWithPolicy.typeUrl, MsgCreateGroupWithPolicyHandler);
