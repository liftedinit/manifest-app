import { MsgUpdateGroupPolicyMetadata } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';

import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

const createMessage = (prefix: string, policyAddress: string, suffix?: string) => {
  return (
    <span className="flex flex-wrap gap-1">
      {prefix} {policyAddress ? <TruncatedAddressWithCopy address={policyAddress} /> : 'unknown'}{' '}
      {suffix}
    </span>
  );
};

export const MsgUpdateGroupPolicyMetadataHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx =>
    createMessage('You updated the policy metadata of group', tx.metadata?.groupPolicyAddress),
  failSender: tx =>
    createMessage('You failed to update policy metadata of group', tx.metadata?.groupPolicyAddress),
  successReceiver: tx =>
    createMessage('Group', tx.metadata.groupPolicyAddress, 'had its policy metadata updated'),
});

registerHandler(MsgUpdateGroupPolicyMetadata.typeUrl, MsgUpdateGroupPolicyMetadataHandler);
