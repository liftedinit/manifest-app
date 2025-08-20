import { MsgUpdateGroupAdmin } from '@manifest-network/manifestjs/dist/codegen/cosmos/group/v1/tx';
import { format } from 'react-string-format';

import { createSenderReceiverHandler } from '@/components/bank/handlers/createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

const createMessage = (template: string, groupId: number, newAdmin: string) => {
  const message = format(
    template,
    groupId,
    newAdmin ? <TruncatedAddressWithCopy address={newAdmin} /> : 'an unknown address'
  );
  return <span className="flex flex-wrap gap-1">{message}</span>;
};

export const MsgUpdateGroupAdminHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => {
    return createMessage(
      'You updated the administrator of group #{0} to {1}',
      tx.metadata?.groupId,
      tx.metadata?.newAdmin
    );
  },
  failSender: tx => {
    return createMessage(
      'You failed to update the administrator of group #{0} to {1}',
      tx.metadata?.groupId,
      tx.metadata?.newAdmin
    );
  },
  successReceiver: tx => {
    return createMessage(
      'You were made administrator of group #{0}',
      tx.metadata?.groupId,
      tx.metadata?.newAdmin
    );
  },
});

registerHandler(MsgUpdateGroupAdmin.typeUrl, MsgUpdateGroupAdminHandler);
