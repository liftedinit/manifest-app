import { MsgCreateGroupPolicy } from '@manifest-network/manifestjs/dist/codegen/cosmos/group/v1/tx';
import { format } from 'react-string-format';

import { createSenderReceiverHandler } from '@/components/bank/handlers/createSenderReceiverHandler';
import { getGroupPolicy } from '@/components/bank/handlers/group/metadata';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { GroupsIcon } from '@/components/icons/GroupsIcon';

const createMessage = (template: string, policyType: string, groupId: string) => {
  const policy = getGroupPolicy(policyType);
  const message = format(template, policy, groupId);
  return <span className={'flex flex-wrap gap-1'}>{message}</span>;
};

export const MsgCreateGroupPolicyHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => {
    return createMessage(
      'You created a {0} decision policy for group #{1}',
      tx.metadata?.decisionPolicy?.['@type'],
      tx.metadata?.groupId
    );
  },
  failSender: tx => {
    return createMessage(
      'You failed to create a {0} decision policy for group #{1}',
      tx.metadata?.decisionPolicy?.['@type'],
      tx.metadata?.groupId
    );
  },
  successReceiver: tx => {
    return createMessage(
      'A {0} decision policy was created for group #{1}',
      tx.metadata?.decisionPolicy?.['@type'],
      tx.metadata?.groupId
    );
  },
});

registerHandler(MsgCreateGroupPolicy.typeUrl, MsgCreateGroupPolicyHandler);
