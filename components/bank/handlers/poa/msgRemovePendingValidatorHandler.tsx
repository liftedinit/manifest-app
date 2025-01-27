import { AdminsIcon } from '@/components/icons/AdminsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgRemovePendingValidatorHandler = createSenderReceiverHandler({
  iconSender: AdminsIcon,
  successSender: tx => `You removed pending validator ${tx.metadata?.validatorAddress}`,
  failSender: tx => `You failed to remove pending validator ${tx.metadata?.validatorAddress}`,
  successReceiver: tx => `Validator ${tx.metadata?.validatorAddress} was removed from pending`,
});
