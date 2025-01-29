import { AdminsIcon } from '@/components/icons/AdminsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgSetPower } from '@liftedinit/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx';

export const MsgSetPowerHandler = createSenderReceiverHandler({
  iconSender: AdminsIcon,
  successSender: tx => (
    <>
      You set the validator {tx.metadata?.validatorAddress} power to {tx.metadata?.power}
    </>
  ),
  failSender: tx => (
    <>
      You failed to set the validator {tx.metadata?.validatorAddress} power to {tx.metadata?.power}
    </>
  ),
  successReceiver: tx => (
    <>
      Validator {tx.metadata?.validatorAddress} had its power set to {tx.metadata?.power}
    </>
  ),
});

registerHandler(MsgSetPower.typeUrl, MsgSetPowerHandler);
