import { FactoryIcon } from '@/components/icons/FactoryIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { formatDenom } from '@/utils';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgSetDenomMetadata } from '@liftedinit/manifestjs/dist/codegen/osmosis/tokenfactory/v1beta1/tx';

export const MsgSetDenomMetadataHandler = createSenderReceiverHandler({
  iconSender: FactoryIcon,
  successSender: tx => <>You set the metadata of denomination {formatDenom(tx.metadata?.base)}</>,
  failSender: tx => <>You failed the metadata of denomination {formatDenom(tx.metadata?.base)}</>,
  successReceiver: tx => (
    <>The {formatDenom(tx.metadata?.base)} denomination had its metadata set</>
  ),
});

registerHandler(MsgSetDenomMetadata.typeUrl, MsgSetDenomMetadataHandler);
