import React from 'react';

import { SigningModalDialog } from '@/components';
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
    <SigningModalDialog
      open={isOpen}
      onClose={() => {
        // skip-go/widget does not have a lot of useful props/events so we kind of
        // have to hack our way around it.
        const allInputs = [...document.querySelectorAll('react-shadow-scope')].map(s =>
          s.shadowRoot?.querySelector('div[open]')
        );
        const isSkipGoDialogOpened = allInputs.filter(Boolean).length > 0;

        // Check that we don't have the widget dialog opened, and prevent closing if we do.
        if (document.querySelector('wcm-modal') !== null && isSkipGoDialogOpened) {
          return;
        }

        setOpen?.(false);
      }}
      title="Send Assets"
      className="z-10"
    >
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
