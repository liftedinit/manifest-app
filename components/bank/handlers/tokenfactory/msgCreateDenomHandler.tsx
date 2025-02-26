import { MsgCreateDenom } from '@liftedinit/manifestjs/dist/codegen/osmosis/tokenfactory/v1beta1/tx';
import { format } from 'react-string-format';

import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { FactoryIcon } from '@/components/icons/FactoryIcon';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { formatDenom } from '@/utils';

import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

const createMessage = (template: string, sender: string, subdenom: string) => {
  const message = format(
    template,
    formatDenom(`factory/${sender}/${subdenom}`),
    sender ? <TruncatedAddressWithCopy address={sender} /> : 'an unknown address'
  );
  return <span className="flex flex-wrap gap-1">{message}</span>;
};
export const MsgCreateDenomHandler = createSenderReceiverHandler({
  iconSender: FactoryIcon,
  successSender: tx =>
    createMessage('You created the {0} denomination', tx.sender, tx.metadata?.subdenom),
  failSender: tx =>
    createMessage('You failed to create the {0} denomination', tx.sender, tx.metadata?.subdenom),
  successReceiver: tx =>
    createMessage('The {0} denomination was created by {1}', tx.sender, tx.metadata?.subdenom),
});

registerHandler(MsgCreateDenom.typeUrl, MsgCreateDenomHandler);
