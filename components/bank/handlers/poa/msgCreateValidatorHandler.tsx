import { AdminsIcon } from '@/components/icons/AdminsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgCreateValidatorHandler = createSenderReceiverHandler({
  iconSender: AdminsIcon,
  successSender: tx => `You created validator ${tx.metadata?.validatorAddress}`,
  failSender: tx => `You failed to create validator ${tx.metadata?.validatorAddress}`,
  successReceiver: tx => `Validator ${tx.metadata?.validatorAddress} was created`,
});
