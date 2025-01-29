import { AdminsIcon } from '@/components/icons/AdminsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgRemoveValidator } from '@liftedinit/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx';

export const MsgRemoveValidatorHandler = createSenderReceiverHandler({
  iconSender: AdminsIcon,
  successSender: tx => <>You removed validator {tx.metadata?.validatorAddress}</>,
  failSender: tx => <>You failed to remove validator {tx.metadata?.validatorAddress}</>,
  successReceiver: tx => <>Validator {tx.metadata?.validatorAddress} was removed</>,
});

registerHandler(MsgRemoveValidator.typeUrl, MsgRemoveValidatorHandler);
