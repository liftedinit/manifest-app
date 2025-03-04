import { MsgSetPower } from '@liftedinit/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx';
import { format } from 'react-string-format';

import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { AdminsIcon } from '@/components/icons/AdminsIcon';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

const createMessage = (template: string, validatorAddress: string, power: number) => {
  const realPower = power / 1000000;
  const message = format(
    template,
    validatorAddress ? <TruncatedAddressWithCopy address={validatorAddress} /> : 'unknown',
    realPower
  );
  return <span className="flex flex-wrap gap-1">{message}</span>;
};
export const MsgSetPowerHandler = createSenderReceiverHandler({
  iconSender: AdminsIcon,
  successSender: tx =>
    createMessage(
      'You set the validator {0} power to {1}',
      tx.metadata?.validatorAddress,
      tx.metadata?.power
    ),
  failSender: tx =>
    createMessage(
      'You failed to set the validator {0} power to {1}',
      tx.metadata?.validatorAddress,
      tx.metadata?.power
    ),
  successReceiver: tx =>
    createMessage(
      'Validator {0} had its power set to {1}',
      tx.metadata?.validatorAddress,
      tx.metadata?.power
    ),
});

registerHandler(MsgSetPower.typeUrl, MsgSetPowerHandler);
