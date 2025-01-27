import { AdminsIcon } from '@/components/icons/AdminsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgRemoveValidatorHandler = createSenderReceiverHandler({
  iconSender: AdminsIcon,
  successSender: tx => `You removed validator ${tx.metadata?.validatorAddress}`,
  failSender: tx => `You failed to remove validator ${tx.metadata?.validatorAddress}`,
  successReceiver: tx => `Validator ${tx.metadata?.validatorAddress} was removed`,
});
