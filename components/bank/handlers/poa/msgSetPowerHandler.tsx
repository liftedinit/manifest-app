import { AdminsIcon } from '@/components/icons/AdminsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgSetPowerHandler = createSenderReceiverHandler({
  iconSender: AdminsIcon,
  successSender: tx =>
    `You set the validator ${tx.metadata?.validatorAddress} power to ${tx.metadata?.power}`,
  failSender: tx =>
    `You failed to set the validator ${tx.metadata?.validatorAddress} power to ${tx.metadata?.power}`,
  successReceiver: tx =>
    `Validator ${tx.metadata?.validatorAddress} had its power set to ${tx.metadata?.power}`,
});
