import { AdminsIcon } from '@/components/icons/AdminsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgRemovePending } from '@liftedinit/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

export const MsgRemovePendingValidatorHandler = createSenderReceiverHandler({
  iconSender: AdminsIcon,
  successSender: tx => (
    <span className="flex gap-1">
      You removed pending validator{' '}
      <TruncatedAddressWithCopy address={tx.metadata?.validatorAddress} slice={24} />{' '}
    </span>
  ),
  failSender: tx => (
    <span className="flex gap-1">
      You failed to remove pending validator{' '}
      <TruncatedAddressWithCopy address={tx.metadata?.validatorAddress} slice={24} />{' '}
    </span>
  ),
  successReceiver: tx => (
    <span className="flex gap-1">
      Validator <TruncatedAddressWithCopy address={tx.metadata?.validatorAddress} slice={24} /> was
      removed from pending
    </span>
  ),
});

registerHandler(MsgRemovePending.typeUrl, MsgRemovePendingValidatorHandler);
