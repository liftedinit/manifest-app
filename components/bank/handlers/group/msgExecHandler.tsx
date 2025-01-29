import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { MsgExec } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '../handlerRegistry';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

export const MsgExecHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => <>You executed proposal #{tx.proposal_ids}</>, // TODO Link to proposal
  failSender: tx => <>You failed to execute proposal #{tx.proposal_ids}</>, // TODO Link to proposal
  successReceiver: tx => (
    <span className="flex gap-1">
      Proposal #{tx.proposal_ids} was executed by{' '}
      <TruncatedAddressWithCopy address={tx.sender} slice={24} />
    </span>
  ), // TODO Link to proposal
  failReceiver: tx => (
    <span className="flex gap-1">
      Proposal #{tx.proposal_ids} failed to execute by{' '}
      <TruncatedAddressWithCopy address={tx.sender} slice={24} />
    </span>
  ), // TODO Link to proposal
});

registerHandler(MsgExec.typeUrl, MsgExecHandler);
