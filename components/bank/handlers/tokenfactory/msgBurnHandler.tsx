import { MsgBurn } from '@manifest-network/manifestjs/dist/codegen/osmosis/tokenfactory/v1beta1/tx';

import { createTokenMessage } from '@/components';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { FactoryIcon } from '@/components/icons/FactoryIcon';

import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

export const MsgBurnHandler = createSenderReceiverHandler({
  iconSender: FactoryIcon,
  successSender: (tx, _, metadata) =>
    createTokenMessage(
      'You burned {0} from {1}',
      [tx.metadata?.amount],
      tx.metadata?.burnFromAddress,
      'red',
      metadata
    ),
  failSender: (tx, _, metadata) =>
    createTokenMessage(
      'You failed to burn {0} from {1}',
      [tx.metadata?.amount],
      tx.metadata?.burnFromAddress,
      'red',
      metadata
    ),
  successReceiver: (tx, _, metadata) =>
    createTokenMessage(
      'You were burned {0} by {1}',
      [tx.metadata?.amount],
      tx.sender,
      'red',
      metadata
    ),
});

registerHandler(MsgBurn.typeUrl, MsgBurnHandler);
