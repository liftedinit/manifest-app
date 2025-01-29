import { AdminsIcon } from '@/components/icons/AdminsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgCreateValidator } from '@liftedinit/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx';

export const MsgCreateValidatorHandler = createSenderReceiverHandler({
  iconSender: AdminsIcon,
  successSender: tx => <>You created validator {tx.metadata?.validatorAddress}</>,
  failSender: tx => <>You failed to create validator {tx.metadata?.validatorAddress}</>,
  successReceiver: tx => <>Validator {tx.metadata?.validatorAddress} was created</>,
});

registerHandler(MsgCreateValidator.typeUrl, MsgCreateValidatorHandler);
