import { AdminsIcon } from '@/components/icons/AdminsIcon';
import { createSenderReceiverHandler } from '../createSenderReceiverHandler';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { MsgRemoveValidator } from '@liftedinit/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

export const MsgRemoveValidatorHandler = createSenderReceiverHandler({
  iconSender: AdminsIcon,
  successSender: tx => (
    <span className="flex gap-1">
      You removed validator{' '}
      <TruncatedAddressWithCopy address={tx.metadata?.validatorAddress} slice={24} />{' '}
    </span>
  ),
  failSender: tx => (
    <span className="flex gap-1">
      You failed to remove validator{' '}
      <TruncatedAddressWithCopy address={tx.metadata?.validatorAddress} slice={24} />{' '}
    </span>
  ),
  successReceiver: tx => (
    <span className="flex gap-1">
      Validator <TruncatedAddressWithCopy address={tx.metadata?.validatorAddress} slice={24} /> was
      removed
    </span>
  ),
});

registerHandler(MsgRemoveValidator.typeUrl, MsgRemoveValidatorHandler);
