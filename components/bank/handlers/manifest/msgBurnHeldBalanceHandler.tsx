import { BurnIcon } from '@/components/icons/BurnIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgBurnHeldBalance } from '@liftedinit/manifestjs/dist/codegen/liftedinit/manifest/v1/tx';
import { createTokenMessage } from '@/components';

export const MsgBurnHeldBalanceHandler = createSenderReceiverHandler({
  iconSender: BurnIcon,
  successSender: (tx, _, metadata) =>
    createTokenMessage(
      'You burned {0} from {1}',
      tx.metadata?.burnCoins?.[0]?.amount,
      tx.metadata?.burnCoins?.[0]?.denom,
      tx.sender,
      'red',
      metadata
    ),
  failSender: 'You failed to burn tokens',
  successReceiver: (tx, _, metadata) =>
    createTokenMessage(
      'You were burned {0} by {1}',
      tx.metadata?.burnCoins?.[0]?.amount,
      tx.metadata?.burnCoins?.[0]?.denom,
      tx.sender,
      'red',
      metadata
    ),
});

registerHandler(MsgBurnHeldBalance.typeUrl, MsgBurnHeldBalanceHandler);
