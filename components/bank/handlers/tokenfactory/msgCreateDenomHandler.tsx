import { formatDenom } from '@/components';
import { FactoryIcon } from '@/components/icons/FactoryIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgCreateDenomHandler = createSenderReceiverHandler({
  iconSender: FactoryIcon,
  successSender: tx =>
    `You created the ${formatDenom(`factory/${tx.sender}/${tx.metadata?.subdenom}`)} denomination`,
  failSender: tx =>
    `You failed to create the ${formatDenom(`factory/${tx.sender}/${tx.metadata?.subdenom}`)} denomination`,
  successReceiver: tx =>
    `The ${formatDenom(`factory/${tx.sender}/${tx.metadata?.subdenom}`)} denomination was created`,
});
