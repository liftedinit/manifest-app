import { FactoryIcon } from '@/components/icons/FactoryIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { formatDenom } from '@/utils';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgCreateDenom } from '@liftedinit/manifestjs/dist/codegen/osmosis/tokenfactory/v1beta1/tx';

export const MsgCreateDenomHandler = createSenderReceiverHandler({
  iconSender: FactoryIcon,
  successSender: tx =>
    `You created the ${formatDenom(`factory/${tx.sender}/${tx.metadata?.subdenom}`)} denomination`,
  failSender: tx =>
    `You failed to create the ${formatDenom(`factory/${tx.sender}/${tx.metadata?.subdenom}`)} denomination`,
  successReceiver: tx =>
    `The ${formatDenom(`factory/${tx.sender}/${tx.metadata?.subdenom}`)} denomination was created`,
});

registerHandler(MsgCreateDenom.typeUrl, MsgCreateDenomHandler);
