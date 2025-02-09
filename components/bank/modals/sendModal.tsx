import React from 'react';
import SendBox from '../components/sendBox';
import { CombinedBalanceInfo } from '@/utils/types';
import { Dialog, Portal } from '@headlessui/react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChainContext } from '@cosmos-kit/core';

interface SendModalProps {
  modalId?: string;
  address: string;
  balances: CombinedBalanceInfo[];
  isBalancesLoading: boolean;
  refetchBalances: () => void;
  isOpen: boolean;
  refetchHistory: () => void;
  selectedDenom?: string;
  setOpen?: (isOpen: boolean) => void;
  isGroup?: boolean;
  admin?: string;
  refetchProposals?: () => void;
  osmosisBalances: CombinedBalanceInfo[];
  isOsmosisBalancesLoading: boolean;
  refetchOsmosisBalances: () => void;
  resolveOsmosisRefetch: () => void;
  chains: Record<string, ChainContext>;
}

export default function SendModal({
  modalId,
  address,
  balances,
  isBalancesLoading,
  refetchBalances,
  refetchHistory,
  selectedDenom,
  isOpen,
  setOpen,
  isGroup,
  admin,
  refetchProposals,
  osmosisBalances,
  isOsmosisBalancesLoading,
  refetchOsmosisBalances,
  resolveOsmosisRefetch,
  chains,
}: SendModalProps) {
  const handleClose = () => setOpen && setOpen(false);

  return (
    <Portal>
      <Dialog
        id={modalId}
        open={isOpen}
        className={`modal ${isOpen ? 'modal-open' : ''} fixed p-0 m-0`}
        onClose={handleClose}
        style={{
          backgroundColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Dialog.Panel
          className="modal-box max-w-xl mx-auto rounded-[24px] bg-[#F4F4FF] dark:bg-[#1D192D] shadow-lg relative"
          aria-label="send modal"
        >
          <button
            onClick={handleClose}
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#00000099] dark:text-[#FFFFFF99] hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF1A]"
          >
            ✕
          </button>

          <h3 className="text-xl font-semibold text-[#161616] dark:text-white mb-6">Send Assets</h3>

          <SendBox
            address={address}
            balances={balances}
            isBalancesLoading={isBalancesLoading}
            refetchBalances={refetchBalances}
            refetchHistory={refetchHistory}
            selectedDenom={selectedDenom}
            isGroup={isGroup}
            admin={admin}
            refetchProposals={refetchProposals}
            osmosisBalances={osmosisBalances}
            isOsmosisBalancesLoading={isOsmosisBalancesLoading}
            refetchOsmosisBalances={refetchOsmosisBalances}
            resolveOsmosisRefetch={resolveOsmosisRefetch}
            chains={chains}
          />
        </Dialog.Panel>
        <Dialog.Backdrop className="modal-backdrop" />
      </Dialog>
    </Portal>
  );
}
