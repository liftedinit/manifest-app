import { MsgRemoveValidator } from '@manifest-network/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx';

import { createValidatorMessage } from '@/components';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { AdminsIcon } from '@/components/icons/AdminsIcon';

import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgRemoveValidatorHandler = createSenderReceiverHandler({
  iconSender: AdminsIcon,
  successSender: tx =>
    createValidatorMessage('You removed validator {0}', tx.metadata?.validatorAddress),
  failSender: tx =>
    createValidatorMessage('You failed to remove validator {0}', tx.metadata?.validatorAddress),
  successReceiver: tx =>
    createValidatorMessage(
      'Validator {0} was removed by {1}',
      tx.metadata?.validatorAddress,
      tx.sender
    ),
});

registerHandler(MsgRemoveValidator.typeUrl, MsgRemoveValidatorHandler);
