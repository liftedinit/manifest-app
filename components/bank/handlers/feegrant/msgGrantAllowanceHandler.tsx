import { MsgGrantAllowance } from '@liftedinit/manifestjs/dist/codegen/cosmos/feegrant/v1beta1/tx';
import { format } from 'react-string-format';

import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MemberIcon } from '@/components/icons/MemberIcon';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

const createMessage = (template: string, addr: string): React.ReactNode => {
  const message = format(
    template,
    addr ? <TruncatedAddressWithCopy address={addr} /> : 'an unknown address'
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
