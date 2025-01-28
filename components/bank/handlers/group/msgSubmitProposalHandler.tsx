import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgSubmitProposal } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';

export const MsgSubmitProposalHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => {
    const groupAddress = tx.metadata?.groupPolicyAddress;
    const proposalId = tx.proposal_ids;
    return groupAddress
      ? `You submitted proposal #${proposalId} to ${groupAddress}`
      : `You submitted proposal #${proposalId}`;
  }, // TODO Link to proposal
  failSender: tx => 'You failed to submit a proposal',
  successReceiver: tx => `Proposal #${tx.proposal_ids} was submitted by ${tx.sender}`.trim(), // TODO Link to proposal
});

registerHandler(MsgSubmitProposal.typeUrl, MsgSubmitProposalHandler);
