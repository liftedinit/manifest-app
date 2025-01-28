import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgWithdrawProposal } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';

export const MsgWithdrawProposalHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => `You withdrew proposal #${tx.proposal_ids}`.trim(), // TODO Link to proposal
  failSender: tx => `You failed to withdraw proposal #${tx.proposal_ids}`.trim(), // TODO Link to proposal
  successReceiver: tx => `Proposal #${tx.proposal_ids} was withdrawn by ${tx.sender}`.trim(), // TODO Link to proposal
});

registerHandler(MsgWithdrawProposal.typeUrl, MsgWithdrawProposalHandler);
