import { TransferIcon } from '@/components/icons/TransferIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { formatDenom } from '@/utils';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgChangeAdmin } from '@liftedinit/manifestjs/dist/codegen/osmosis/tokenfactory/v1beta1/tx';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { format } from 'react-string-format';

const createMessage = (template: string, newAdmin: string, denom: string) => {
  const message = format(
    template,
    newAdmin ? <TruncatedAddressWithCopy address={newAdmin} /> : 'unknown',
    denom ? formatDenom(denom) : 'unknown'
  );
  return <span className="flex gap-1">{message}</span>;
};

export const MsgChangeAdminHandler = createSenderReceiverHandler({
  iconSender: TransferIcon,
  successSender: tx =>
    createMessage(
      'You changed the administrator of the {1} token to {0}',
      tx.metadata?.newAdmin,
      tx.metadata?.denom
    ),
  failSender: tx =>
    createMessage(
      'You failed to change the administrator of the {1} token to {0}',
      tx.metadata?.newAdmin,
      tx.metadata?.denom
    ),
  successReceiver: tx =>
    createMessage(
      'The administrator of the {1} token was changed to {0}',
      tx.metadata?.newAdmin,
      tx.metadata?.denom
    ),
});

registerHandler(MsgChangeAdmin.typeUrl, MsgChangeAdminHandler);
