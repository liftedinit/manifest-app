import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { MsgCreateGroupPolicy } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';
import { createSenderReceiverHandler } from '@/components/bank/handlers/createSenderReceiverHandler';
import { format } from 'react-string-format';
import { getGroupPolicy } from '@/components/bank/handlers/group/metadata';

const createMessage = (template: string, policyType: string, groupId: string) => {
  const policy = getGroupPolicy(policyType);
  const message = format(template, policy, groupId);
  return <span className={'flex gap-1'}>{message}</span>;
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
