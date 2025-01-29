import { AdminsIcon } from '@/components/icons/AdminsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgRemovePending } from '@liftedinit/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx';

export const MsgRemovePendingValidatorHandler = createSenderReceiverHandler({
  iconSender: AdminsIcon,
  successSender: tx => <>You removed pending validator {tx.metadata?.validatorAddress}</>,
  failSender: tx => <>You failed to remove pending validator {tx.metadata?.validatorAddress}</>,
  successReceiver: tx => <>Validator {tx.metadata?.validatorAddress} was removed from pending</>,
});

registerHandler(MsgRemovePending.typeUrl, MsgRemovePendingValidatorHandler);
