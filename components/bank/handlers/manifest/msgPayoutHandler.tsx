import { MintIcon } from '@/components/icons/MintIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgPayout } from '@liftedinit/manifestjs/dist/codegen/liftedinit/manifest/v1/tx';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { createTokenMessage } from '@/components';
import { format } from 'react-string-format';

export const MsgPayoutHandler = createSenderReceiverHandler({
  iconSender: MintIcon,
  successSender: (tx, _, metadata) => {
    return tx.metadata?.payoutPairs?.length > 1
      ? format('You minted tokens to {0} addresses', tx.metadata?.payoutPairs?.length)
      : createTokenMessage(
          'You minted {0} to {1}',
          tx.metadata?.payoutPairs?.[0]?.coin?.amount,
          tx.metadata?.payoutPairs?.[0]?.coin?.denom,
          tx.metadata?.payoutPairs?.[0]?.address,
          'green',
          metadata
        );
  },
  failSender: 'You failed to mint tokens',
  successReceiver: (tx, _, metadata) => {
    return tx.metadata?.payoutPairs?.length > 1
      ? format(
          'You were minted tokens by {0}',
          tx.sender ? (
            <TruncatedAddressWithCopy address={tx.sender} slice={24} />
          ) : (
            'an unknown address'
          )
        )
      : createTokenMessage(
          'You were minted {0} by {1}',
          tx.metadata?.payoutPairs?.[0]?.coin?.amount,
          tx.metadata?.payoutPairs?.[0]?.coin?.denom,
          tx.sender,
          'green',
          metadata
        );
  },
});

registerHandler(MsgPayout.typeUrl, MsgPayoutHandler);
