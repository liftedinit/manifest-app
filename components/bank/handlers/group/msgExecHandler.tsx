import { GroupsIcon } from '@/components/icons/GroupsIcon';
import { MsgExec } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '../handlerRegistry';

export const MsgExecHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => `You executed proposal #${tx.proposal_ids}`.trim(), // TODO Link to proposal
  failSender: tx => `You failed to execute proposal #${tx.proposal_ids}`.trim(), // TODO Link to proposal
  successReceiver: tx => `Proposal #${tx.proposal_ids} was executed by ${tx.sender}`.trim(), // TODO Link to proposal
  failReceiver: tx => `Proposal #${tx.proposal_ids} failed to execute by ${tx.sender}`.trim(), // TODO Link to proposal
});

registerHandler(MsgExec.typeUrl, MsgExecHandler);
