import { MsgUpdateGroupPolicyDecisionPolicy } from '@manifest-network/manifestjs/dist/codegen/cosmos/group/v1/tx';
import { format } from 'react-string-format';

import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

const createMessage = (template: string, policyAddress: string) => {
  const message = format(
    template,
    policyAddress ? <TruncatedAddressWithCopy address={policyAddress} /> : 'unknown'
  );
  return <span className="flex flex-wrap gap-1">{message}</span>;
};

export const MsgUpdateGroupPolicyDecisionPolicyHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx =>
    createMessage('You updated the decision policy of group {0}', tx.metadata?.groupPolicyAddress),
  failSender: tx =>
    createMessage(
      'You failed to update the decision policy of group {0}',
      tx.metadata?.groupPolicyAddress
    ),
  successReceiver: tx =>
    createMessage('Group {0} had its decision policy updated', tx.metadata.groupPolicyAddress),
});

registerHandler(
  MsgUpdateGroupPolicyDecisionPolicy.typeUrl,
  MsgUpdateGroupPolicyDecisionPolicyHandler
);
