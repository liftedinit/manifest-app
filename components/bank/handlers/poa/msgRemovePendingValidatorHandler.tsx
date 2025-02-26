import { MsgRemovePending } from '@liftedinit/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx';

import { createValidatorMessage } from '@/components';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { AdminsIcon } from '@/components/icons/AdminsIcon';

import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgRemovePendingValidatorHandler = createSenderReceiverHandler({
  iconSender: AdminsIcon,
  successSender: tx =>
    createValidatorMessage('You removed pending validator {0}', tx.metadata?.validatorAddress),
  failSender: tx =>
    createValidatorMessage(
      'You failed to remove pending validator {0}',
      tx.metadata?.validatorAddress
    ),
  successReceiver: tx =>
    createValidatorMessage(
      'Validator {0} was removed from pending by {1}',
      tx.metadata?.validatorAddress,
      tx.sender
    ),
});

registerHandler(MsgRemovePending.typeUrl, MsgRemovePendingValidatorHandler);
