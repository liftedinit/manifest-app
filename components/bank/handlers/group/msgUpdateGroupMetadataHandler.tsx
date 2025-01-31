import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgUpdateGroupMetadata } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';

export const MsgUpdateGroupMetadataHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => <>You updated the metadata of group #{tx.metadata?.groupId}</>,
  failSender: tx => <>You failed to update the metadata of group #{tx.metadata?.groupId}</>,
  successReceiver: tx => <>Group #{tx.metadata?.groupId} had its metadata updated</>,
});

registerHandler(MsgUpdateGroupMetadata.typeUrl, MsgUpdateGroupMetadataHandler);
