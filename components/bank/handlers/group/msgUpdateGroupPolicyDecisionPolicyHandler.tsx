import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgUpdateGroupPolicyDecisionPolicy } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

export const MsgUpdateGroupPolicyDecisionPolicyHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => {
    const groupPolicyAddress = tx.metadata?.groupPolicyAddress ? (
      <TruncatedAddressWithCopy address={tx.metadata?.groupPolicyAddress} slice={24} />
    ) : (
      'unknown'
    );
    return (
      <span className="flex gap-1">
        You updated the decision policy of group {groupPolicyAddress}
      </span>
    );
  },
  failSender: tx => {
    const groupPolicyAddress = tx.metadata?.groupPolicyAddress ? (
      <TruncatedAddressWithCopy address={tx.metadata?.groupPolicyAddress} slice={24} />
    ) : (
      'unknown'
    );
    return (
      <span className="flex gap-1">
        You failed to update the decision policy of group {groupPolicyAddress}
      </span>
    );
  },
  successReceiver: tx => {
    const groupPolicyAddress = tx.metadata?.groupPolicyAddress ? (
      <TruncatedAddressWithCopy address={tx.metadata.groupPolicyAddress} slice={24} />
    ) : (
      'unknown'
    );
    return (
      <span className="flex gap-1">Group {groupPolicyAddress} had its decision policy updated</span>
    );
  },
});

registerHandler(
  MsgUpdateGroupPolicyDecisionPolicy.typeUrl,
  MsgUpdateGroupPolicyDecisionPolicyHandler
);
