import { MsgExec } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';
import { format } from 'react-string-format';

import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '../handlerRegistry';

const createMessage = (template: string, id: string, sender?: string) => {
  const message = format(
    template,
    id ?? 'unknown',
    sender ? <TruncatedAddressWithCopy address={sender} /> : 'an unknown address'
  );
  return <span className="flex flex-wrap gap-1">{message}</span>;
};

export const MsgExecHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => createMessage('You executed proposal #{0}', tx.proposal_ids?.[0]), // TODO Link to proposal
  failSender: tx => createMessage('You failed to execute proposal #{0}', tx.proposal_ids?.[0]), // TODO Link to proposal
  successReceiver: tx =>
    createMessage('Proposal #{0} was executed by {1}', tx.proposal_ids?.[0], tx.sender), // TODO Link to proposal
  failReceiver: tx =>
    createMessage('Proposal #{0} failed to be executed by {1}', tx.proposal_ids?.[0], tx.sender), // TODO Link to proposal
});

registerHandler(MsgExec.typeUrl, MsgExecHandler);
