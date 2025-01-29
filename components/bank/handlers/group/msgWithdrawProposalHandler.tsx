import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgWithdrawProposal } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

export const MsgWithdrawProposalHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => <>You withdrew proposal #{tx.proposal_ids}</>, // TODO Link to proposal
  failSender: tx => <>You failed to withdraw proposal #{tx.proposal_ids}</>, // TODO Link to proposal
  successReceiver: tx => (
    <span className="flex gap-1">
      Proposal #{tx.proposal_ids} was withdrawn by{' '}
      <TruncatedAddressWithCopy address={tx.sender} slice={24} />
    </span>
  ), // TODO Link to proposal
});

registerHandler(MsgWithdrawProposal.typeUrl, MsgWithdrawProposalHandler);
