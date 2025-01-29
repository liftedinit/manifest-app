import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgSubmitProposal } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

export const MsgSubmitProposalHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => {
    const groupAddress = tx.metadata?.groupPolicyAddress;
    const proposalId = tx.proposal_ids;
    return (
      <span className="flex gap-1">
        You submitted proposal #{proposalId}{' '}
        {groupAddress && (
          <>
            to
            <TruncatedAddressWithCopy address={groupAddress} slice={24} />
          </>
        )}
      </span>
    );
  }, // TODO Link to proposal
  failSender: 'You failed to submit a proposal',
  successReceiver: tx => (
    <span className="flex gap-1">
      Proposal #{tx.proposal_ids} was submitted by{' '}
      <TruncatedAddressWithCopy address={tx.sender} slice={24} />
    </span>
  ), // TODO Link to proposal
});

registerHandler(MsgSubmitProposal.typeUrl, MsgSubmitProposalHandler);
