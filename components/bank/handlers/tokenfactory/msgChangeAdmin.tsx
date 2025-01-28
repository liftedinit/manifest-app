import { TransferIcon } from '@/components/icons/TransferIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { formatDenom } from '@/utils';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgChangeAdmin } from '@liftedinit/manifestjs/dist/codegen/osmosis/tokenfactory/v1beta1/tx';

export const MsgChangeAdminHandler = createSenderReceiverHandler({
  iconSender: TransferIcon,
  successSender: tx =>
    `You changed the administrator of the ${formatDenom(tx.metadata?.denom)} token to ${tx.metadata?.newAdmin ?? 'an unknown address'}`,
  failSender: tx =>
    `You failed to change the administrator of the ${formatDenom(tx.metadata?.denom)} token to ${tx.metadata?.newAdmin ?? 'an unknown address'}`,
  successReceiver: tx =>
    `You were set administrator of the ${formatDenom(tx.metadata?.denom)} token by ${tx.sender ?? 'an unknown address'}`,
});

registerHandler(MsgChangeAdmin.typeUrl, MsgChangeAdminHandler);
