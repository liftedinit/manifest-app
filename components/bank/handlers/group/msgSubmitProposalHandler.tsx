import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgSubmitProposalHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => `You submitted proposal #${tx.proposal_ids}`.trim(), // TODO Link to proposal
  failSender: tx => 'You failed to submit a proposal',
  successReceiver: tx => `Proposal #${tx.proposal_ids} was submitted by ${tx.sender}`.trim(), // TODO Link to proposal
});
