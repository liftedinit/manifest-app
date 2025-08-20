import { MsgVote } from '@manifest-network/manifestjs/dist/codegen/cosmos/group/v1/tx';
import { format } from 'react-string-format';

import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { formatVote } from '@/utils';

import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

const createMessage = (template: string, vote: string, ids: string, sender?: string) => {
  const message = format(
    template,
    formatVote(vote),
    ids,
    sender ? <TruncatedAddressWithCopy address={sender} /> : 'an unknown address'
  );
  return <span className="flex flex-wrap gap-1">{message}</span>;
};

export const MsgVoteHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx =>
    createMessage('You voted {0} on proposal #{1}', tx.metadata?.option, tx.proposal_ids?.[0]), // TODO Link to proposal
  failSender: tx =>
    createMessage(
      'You failed to vote {0} on proposal #{1}',
      tx.metadata?.option,
      tx.proposal_ids?.[0]
    ), // TODO Link to proposal
  successReceiver: tx =>
    createMessage(
      'Proposal #{1} was voted on {0} by {2}',
      tx.metadata?.option,
      tx.proposal_ids?.[0],
      tx.sender
    ), // TODO Link to proposal
});

registerHandler(MsgVote.typeUrl, MsgVoteHandler);
