import { MsgGrantAllowance } from '@liftedinit/manifestjs/dist/codegen/cosmos/feegrant/v1beta1/tx';
import { MemberIcon } from '@/components/icons/MemberIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { format } from 'react-string-format';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

const createMessage = (template: string, addr: string) => {
  const message = format(
    template,
    addr ? <TruncatedAddressWithCopy address={addr} slice={24} /> : 'an unknown address'
  );
  return <span className="flex gap-1">{message}</span>;
};

export const MsgGrantAllowanceHandler = createSenderReceiverHandler({
  iconSender: MemberIcon,
  successSender: tx => createMessage('You granted a fee allowance to {0}', tx.metadata?.grantee),
  failSender: tx =>
    createMessage('You failed to grant a fee allowance to {0}', tx.metadata?.grantee),
  successReceiver: tx =>
    createMessage('You were granted a fee allowance by {0}', tx.metadata?.granter),
});

registerHandler(MsgGrantAllowance.typeUrl, MsgGrantAllowanceHandler);
