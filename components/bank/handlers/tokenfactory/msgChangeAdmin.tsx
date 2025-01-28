import { TransferIcon } from '@/components/icons/TransferIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { formatDenom } from '@/utils';

export const MsgChangeAdminHandler = createSenderReceiverHandler({
  iconSender: TransferIcon,
  successSender: tx =>
    `You changed the administrator of the ${formatDenom(tx.metadata?.denom)} token to ${tx.metadata?.newAdmin}`.trim(),
  failSender: tx =>
    `You failed to change the administrator of the ${formatDenom(tx.metadata?.denom)} token to ${tx.metadata?.newAdmin}`.trim(),
  successReceiver: tx =>
    `You were set administrator of the ${formatDenom(tx.metadata?.denom)} token by ${tx.sender}`.trim(),
});
