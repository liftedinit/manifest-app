import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgWithdrawProposal } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { format } from 'react-string-format';

const createMessage = (template: string, ids: string, sender?: string) => {
  const message = format(
    template,
    ids,
    sender ? <TruncatedAddressWithCopy address={sender} slice={24} /> : 'an unknown address'
  );
  return <span className="flex gap-1">{message}</span>;
};

export const MsgWithdrawProposalHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => createMessage('You withdrew proposal #{0}', tx.proposal_ids?.[0]), // TODO Link to proposal
  failSender: tx => createMessage('You failed to withdraw proposal #{0}', tx.proposal_ids?.[0]), // TODO Link to proposal
  successReceiver: tx =>
    createMessage('Proposal #{0} was withdrawn by {1}', tx.proposal_ids?.[0], tx.sender), // TODO Link to proposal
});

registerHandler(MsgWithdrawProposal.typeUrl, MsgWithdrawProposalHandler);
