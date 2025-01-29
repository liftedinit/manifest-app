import { AdminsIcon } from '@/components/icons/AdminsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgSetPower } from '@liftedinit/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

export const MsgSetPowerHandler = createSenderReceiverHandler({
  iconSender: AdminsIcon,
  successSender: tx => (
    <span className="flex gap-1">
      You set the validator{' '}
      <TruncatedAddressWithCopy address={tx.metadata?.validatorAddress} slice={24} /> power to{' '}
      {tx.metadata?.power}
    </span>
  ),
  failSender: tx => (
    <span className="flex gap-1">
      You failed to set the validator{' '}
      <TruncatedAddressWithCopy address={tx.metadata?.validatorAddress} slice={24} /> power to{' '}
      {tx.metadata?.power}
    </span>
  ),
  successReceiver: tx => (
    <span className="flex gap-1">
      Validator <TruncatedAddressWithCopy address={tx.metadata?.validatorAddress} slice={24} /> had
      its power set to {tx.metadata?.power}
    </span>
  ),
});

registerHandler(MsgSetPower.typeUrl, MsgSetPowerHandler);
