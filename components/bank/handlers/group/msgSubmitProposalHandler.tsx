import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgSubmitProposal } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';

export const MsgSubmitProposalHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => {
    const groupAddress = tx.metadata?.groupPolicyAddress;
    const proposalId = tx.proposal_ids;
    return (
      <>
        You submitted proposal #{proposalId} {groupAddress && <span>to {groupAddress}</span>}
      </>
    );
  }, // TODO Link to proposal
  failSender: 'You failed to submit a proposal',
  successReceiver: tx => (
    <>
      Proposal #{tx.proposal_ids} was submitted by {tx.sender}
    </>
  ), // TODO Link to proposal
});

registerHandler(MsgSubmitProposal.typeUrl, MsgSubmitProposalHandler);
