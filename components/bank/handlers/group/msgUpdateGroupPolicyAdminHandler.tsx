import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { MsgUpdateGroupPolicyAdmin } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';
import { createSenderReceiverHandler } from '@/components/bank/handlers/createSenderReceiverHandler';
import { format } from 'react-string-format';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

const createMessage = (
  template: string,
  groupPolicyAddr: string,
  newAdmin: string,
  sender?: string
) => {
  const message = format(
    template,
    groupPolicyAddr ? <TruncatedAddressWithCopy address={groupPolicyAddr} /> : 'an unknown address',
    newAdmin ? <TruncatedAddressWithCopy address={newAdmin} /> : 'an unknown address',
    sender ? <TruncatedAddressWithCopy address={sender} /> : 'an unknown address'
  );
  return <span className="flex gap-1">{message}</span>;
};

export const MsgUpdateGroupPolicyAdminHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => {
    return createMessage(
      'You updated the group policy {0} administrator to {1}',
      tx.metadata?.groupPolicyAddress,
      tx.metadata?.newAdmin
    );
  },
  failSender: tx => {
    return createMessage(
      'You failed to update the group policy {0} administrator to {1}',
      tx.metadata?.groupPolicyAddress,
      tx.metadata?.newAdmin
    );
  },
  successReceiver: tx => {
    return createMessage(
      'You were made administrator of group policy {0} by {2}',
      tx.metadata?.groupPolicyAddress,
      tx.metadata?.newAdmin,
      tx.sender
    );
  },
});

registerHandler(MsgUpdateGroupPolicyAdmin.typeUrl, MsgUpdateGroupPolicyAdminHandler);
