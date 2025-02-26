import { MsgSetDenomMetadata } from '@liftedinit/manifestjs/dist/codegen/osmosis/tokenfactory/v1beta1/tx';
import { format } from 'react-string-format';

import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { FactoryIcon } from '@/components/icons/FactoryIcon';
import { formatDenom } from '@/utils';

import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

const createMessage = (template: string, base: string) => {
  const message = format(template, formatDenom(base));
  return <span className="flex flex-wrap gap-1">{message}</span>;
};
export const MsgSetDenomMetadataHandler = createSenderReceiverHandler({
  iconSender: FactoryIcon,
  successSender: tx =>
    createMessage('You set the metadata of denomination {0}', tx.metadata?.metadata.base),
  failSender: tx =>
    createMessage('You failed to set the metadata of denomination {0}', tx.metadata?.metadata.base),
  successReceiver: tx =>
    createMessage('The {0} denomination had its metadata set', tx.metadata?.metadata.base),
});

registerHandler(MsgSetDenomMetadata.typeUrl, MsgSetDenomMetadataHandler);
