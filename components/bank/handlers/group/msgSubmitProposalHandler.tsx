import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgSubmitProposal } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { format } from 'react-string-format';

const createMessage = (template: string, ids: string, policyAddress: string, sender?: string) => {
  const message = format(
    template,
    ids,
    policyAddress ? <TruncatedAddressWithCopy address={policyAddress} /> : 'an unknown address',
    sender ? <TruncatedAddressWithCopy address={sender} /> : 'an unknown address'
  );
  return <span className="flex gap-1">{message}</span>;
};

export const MsgSubmitProposalHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx =>
    createMessage(
      'You submitted proposal #{0} to {1}',
      tx.proposal_ids?.[0],
      tx.metadata?.groupPolicyAddress
    ), // TODO Link to proposal
  failSender: 'You failed to submit a proposal',
  successReceiver: tx =>
    createMessage(
      'Proposal #{0} was submitted to {1} by {2}',
      tx.proposal_ids?.[0],
      tx.metadata?.groupPolicyAddress,
      tx.sender
    ), // TODO Link to proposal
});

registerHandler(MsgSubmitProposal.typeUrl, MsgSubmitProposalHandler);
