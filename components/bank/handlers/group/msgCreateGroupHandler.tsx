import { MsgCreateGroup } from '@manifest-network/manifestjs/dist/codegen/cosmos/group/v1/tx';
import React from 'react';
import { format } from 'react-string-format';

import { createSenderReceiverHandler } from '@/components/bank/handlers/createSenderReceiverHandler';
import { getGroupTitle } from '@/components/bank/handlers/group/metadata';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { GroupsIcon } from '@/components/icons/GroupsIcon';

const createMessage = (template: string, metadata: any) => {
  const title = getGroupTitle(metadata);
  const named = title ? `named: ${title}` : 'with an unknown name';
  const message = format(template, named);
  return <span className="flex flex-wrap gap-1">{message}</span>;
};

export const MsgCreateGroupHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => {
    return createMessage('You created a new group {0}', tx.metadata?.metadata);
  },
  failSender: tx => {
    return createMessage('You failed to create a new group {0}', tx.metadata?.metadata);
  },
  successReceiver: tx => {
    return createMessage('You were mentioned in a new group {0}', tx.metadata?.metadata);
  },
});

registerHandler(MsgCreateGroup.typeUrl, MsgCreateGroupHandler);
