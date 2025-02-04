import { BankIcon } from '@/components/icons/BankIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgSend } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/tx';
import { createTokenMessage } from '@/components';

export const MsgSendHandler = createSenderReceiverHandler({
  iconSender: BankIcon,
  successSender: (tx, _, metadata) => {
    return createTokenMessage(
      'You sent {0} to {1}',
      tx.metadata?.amount?.[0]?.amount,
      tx.metadata?.amount?.[0]?.denom,
      tx.metadata?.toAddress,
      'red',
      metadata
    );
  },
  failSender: (tx, _, metadata) => {
    return createTokenMessage(
      'You failed to send {0} to {1}',
      tx.metadata?.amount?.[0]?.amount,
      tx.metadata?.amount?.[0]?.denom,
      tx.metadata?.toAddress,
      'red',
      metadata
    );
  },
  successReceiver: (tx, _, metadata) => {
    return createTokenMessage(
      'You received {0} from {1}',
      tx.metadata?.amount?.[0]?.amount,
      tx.metadata?.amount?.[0]?.denom,
      tx.sender,
      'green',
      metadata
    );
  },
});

registerHandler(MsgSend.typeUrl, MsgSendHandler);
