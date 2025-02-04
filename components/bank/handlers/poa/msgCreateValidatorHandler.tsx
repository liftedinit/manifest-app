import { AdminsIcon } from '@/components/icons/AdminsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgCreateValidator } from '@liftedinit/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx';
import { createValidatorMessage } from '@/components';

export const MsgCreateValidatorHandler = createSenderReceiverHandler({
  iconSender: AdminsIcon,
  successSender: tx =>
    createValidatorMessage('You created validator {0}', tx.metadata?.validatorAddress),
  failSender: tx =>
    createValidatorMessage('You failed to create validator {0}', tx.metadata?.validatorAddress),
  successReceiver: tx =>
    createValidatorMessage(
      'Validator {0} was created by {1}',
      tx.metadata.validatorAddress,
      tx.sender
    ),
});

registerHandler(MsgCreateValidator.typeUrl, MsgCreateValidatorHandler);
