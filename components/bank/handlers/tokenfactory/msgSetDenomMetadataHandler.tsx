import { FactoryIcon } from '@/components/icons/FactoryIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { formatDenom } from '@/utils';

export const MsgSetDenomMetadataHandler = createSenderReceiverHandler({
  iconSender: FactoryIcon,
  successSender: tx => `You set the metadata of denomination ${formatDenom(tx.metadata?.base)}`,
  failSender: tx => `You failed the metadata of denomination ${formatDenom(tx.metadata?.base)}`,
  successReceiver: tx => `The ${formatDenom(tx.metadata?.base)} denomination had its metadata set`,
});
