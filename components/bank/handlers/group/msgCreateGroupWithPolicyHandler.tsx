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
    return <>You created a new group {title && <span>named \&#34;{title}\&#34;</span>}</>;
  },
  failSender: 'You failed to create a new group',
  successReceiver: tx => {
    const metadata = tx.metadata?.groupMetadata;
    const title = getGroupTitle(metadata);
    return <>You were mentioned in a new group {title && <span>named &#34;{title}&#34;</span>}</>;
  },
});

registerHandler(MsgCreateGroupWithPolicy.typeUrl, MsgCreateGroupWithPolicyHandler);
