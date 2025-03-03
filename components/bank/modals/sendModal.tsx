import { Dialog } from '@headlessui/react';
import React from 'react';

import { SignModal } from '@/components/react';
import { SigningModalDialog } from '@/components/react/modalDialog';
import { CombinedBalanceInfo } from '@/utils/types';

import SendBox from '../components/sendBox';

interface SendModalProps {
  modalId?: string;
  address: string;
  balances: CombinedBalanceInfo[];
  isBalancesLoading: boolean;
  isOpen: boolean;
  selectedDenom?: string;
  setOpen?: (isOpen: boolean) => void;
  isGroup?: boolean;
  admin?: string;
}

export default function SendModal({
  address,
  balances,
  isBalancesLoading,
  selectedDenom,
  isOpen,
  setOpen,
  isGroup,
  admin,
}: SendModalProps) {
  return (
    <SigningModalDialog open={isOpen} onClose={() => setOpen?.(false)} title="Send Assets">
      <SendBox
        address={address}
        balances={balances}
        isBalancesLoading={isBalancesLoading}
        selectedDenom={selectedDenom}
        isGroup={isGroup}
        admin={admin}
      />
    </SigningModalDialog>
  );
}
