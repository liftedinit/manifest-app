import { FactoryIcon } from '@/components/icons/FactoryIcon';
import { formatAmount, formatDenom, formatLargeNumber } from '@/utils';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgMint } from '@liftedinit/manifestjs/dist/codegen/osmosis/tokenfactory/v1beta1/tx';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { createTokenMessage } from '@/components';

export const MsgMintHandler = createSenderReceiverHandler({
  iconSender: FactoryIcon,
  successSender: (tx, _, metadata) =>
    createTokenMessage(
      'You minted {0} to {1}',
      tx.metadata?.amount?.amount,
      tx.metadata?.amount?.denom,
      tx.metadata?.mintToAddress,
      'green',
      metadata
    ),
  failSender: (tx, _, metadata) =>
    createTokenMessage(
      'You failed to mint {0} to {1}',
      tx.metadata?.amount?.amount,
      tx.metadata?.amount?.denom,
      tx.metadata?.mintToAddress,
      'red',
      metadata
    ),
  successReceiver: (tx, _, metadata) =>
    createTokenMessage(
      'You were minted {0} from {1}',
      tx.metadata?.amount?.amount,
      tx.metadata?.amount?.denom,
      tx.sender,
      'green',
      metadata
    ),
});

registerHandler(MsgMint.typeUrl, MsgMintHandler);
