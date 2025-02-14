import { TransferIcon } from '@/components/icons/TransferIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgRecvPacket } from 'cosmjs-types/ibc/core/channel/v1/tx';
import { createTokenMessage } from '@/components';
import { CoinSDKType } from '@liftedinit/manifestjs/src/codegen/cosmos/base/v1beta1/coin';

export const MsgRecvPacketHandler = createSenderReceiverHandler({
  iconSender: TransferIcon,
  successSender: 'N/A',
  failSender: 'N/A',
  successReceiver: (tx, _, metadata) => {
    const requiredFields = ['amount', 'denom', 'sender', 'receiver']; // FungibleTokenPacketData fields (ICS-20)
    const hasAllFields = requiredFields.every(field => field in (tx.metadata?.decodedData ?? {}));
    if (!hasAllFields) {
      return 'Unsupported IBC packet';
    }

    const denom = tx.metadata?.decodedData?.denom?.replace(/transfer\/channel-\d+\//, '');
    const amounts: CoinSDKType[] = [{ denom: denom, amount: tx.metadata?.decodedData?.amount }];
    return createTokenMessage(
      'You received {0} from {1} via IBC',
      amounts,
      tx.sender,
      'green',
      metadata
    );
  },
});

registerHandler(MsgRecvPacket.typeUrl, MsgRecvPacketHandler);
