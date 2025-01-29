import { TransferIcon } from '@/components/icons/TransferIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { formatDenom } from '@/utils';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgChangeAdmin } from '@liftedinit/manifestjs/dist/codegen/osmosis/tokenfactory/v1beta1/tx';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

export const MsgChangeAdminHandler = createSenderReceiverHandler({
  iconSender: TransferIcon,
  successSender: tx => {
    const newAdmin = tx.metadata?.newAdmin ? (
      <TruncatedAddressWithCopy address={tx.metadata.newAdmin} slice={24} />
    ) : (
      'an unknown address'
    );
    return (
      <span className="flex gap-1">
        You changed the administrator of the {formatDenom(tx.metadata?.denom)} token to {newAdmin}
      </span>
    );
  },
  failSender: tx => {
    const newAdmin = tx.metadata?.newAdmin ? (
      <TruncatedAddressWithCopy address={tx.metadata.newAdmin} slice={24} />
    ) : (
      'an unknown address'
    );
    return (
      <span className="flex gap-1">
        You failed to change the administrator of the {formatDenom(tx.metadata?.denom)} token to{' '}
        {newAdmin}
      </span>
    );
  },
  successReceiver: tx => {
    const sender = tx.sender ? (
      <TruncatedAddressWithCopy address={tx.sender} slice={24} />
    ) : (
      'an unknown address'
    );
    return (
      <span className="flex gap-1">
        You were set administrator of the {formatDenom(tx.metadata?.denom)} token by {sender}
      </span>
    );
  },
});

registerHandler(MsgChangeAdmin.typeUrl, MsgChangeAdminHandler);
