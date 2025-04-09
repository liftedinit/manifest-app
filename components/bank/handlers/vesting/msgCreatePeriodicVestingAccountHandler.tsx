import { MsgCreatePeriodicVestingAccount } from '@liftedinit/manifestjs/dist/codegen/cosmos/vesting/v1beta1/tx';
import { format } from 'react-string-format';

import { TruncatedAddressWithCopy } from '@/components';
import { createSenderReceiverHandler } from '@/components/bank/handlers/createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { BankIcon } from '@/components/icons/BankIcon';

const createMessage = (template: string, recipient: string, sender?: string) => {
  const message = format(
    template,
    recipient ? <TruncatedAddressWithCopy address={recipient} /> : 'an unknown address',
    sender ? <TruncatedAddressWithCopy address={sender} /> : 'an unknown address'
  );
  return <span className="flex flex-wrap gap-1">{message}</span>;
};

export const MsgCreatePeriodicVestingAccountHandler = createSenderReceiverHandler({
  iconSender: BankIcon,
  successSender: tx =>
    createMessage(
      'You successfully created a periodic vesting account for {0}',
      tx.metadata?.toAddress
    ),
  failSender: tx =>
    createMessage(
      'You failed to create a periodic vesting account for {0}',
      tx.metadata?.toAddress
    ),
  successReceiver: tx =>
    createMessage(
      'You were created a periodic vesting account by {1}',
      tx.metadata?.toAddress,
      tx.sender
    ),
});

registerHandler(MsgCreatePeriodicVestingAccount.typeUrl, MsgCreatePeriodicVestingAccountHandler);
