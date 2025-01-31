import React from 'react';
import { createSenderReceiverHandler } from '@/components/bank/handlers/createSenderReceiverHandler';
import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { format } from 'react-string-format';
import { MsgCreateGroup } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';

const createMessage = (template: string, numMembers: number) => {
  const message = format(template, numMembers);
  return <span className="flex gap-1">{message}</span>;
};

export const MsgCreateGroupHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => {
    return createMessage('You created a group with {0} members', tx.metadata?.members?.length);
  },
  failSender: tx => {
    return createMessage(
      'You failed to create a group with {0} members',
      tx.metadata?.members?.length
    );
  },
  successReceiver: tx => {
    return createMessage(
      'You were added to a group with {0} members',
      tx.metadata?.members?.length
    );
  },
});

registerHandler(MsgCreateGroup.typeUrl, MsgCreateGroupHandler);
