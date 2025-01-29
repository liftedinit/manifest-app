import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { formatVote } from '@/utils';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgVote } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';

export const MsgVoteHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => (
    <>
      You voted {formatVote(tx.metadata?.option)} on proposal #{tx.proposal_ids}
    </>
  ), // TODO Link to proposal
  failSender: tx => <>You failed to vote on proposal #{tx.proposal_ids}</>, // TODO Link to proposal
  successReceiver: tx => (
    <>
      Proposal #{tx.proposal_ids} was voted on by {tx.sender}
    </>
  ),
});

registerHandler(MsgVote.typeUrl, MsgVoteHandler);
