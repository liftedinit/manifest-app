import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgWithdrawProposalHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => `You withdrew proposal #${tx.proposal_ids}`.trim(), // TODO Link to proposal
  failSender: tx => `You failed to withdraw proposal #${tx.proposal_ids}`.trim(), // TODO Link to proposal
  successReceiver: tx => `Proposal #${tx.proposal_ids} was withdrawn by ${tx.sender}`.trim(), // TODO Link to proposal
});
