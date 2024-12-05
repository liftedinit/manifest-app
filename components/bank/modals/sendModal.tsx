import React from 'react';
import SendBox from '../components/sendBox';
import { CombinedBalanceInfo } from '@/utils/types';
import { useEffect } from 'react';

interface SendModalProps {
  modalId: string;
  address: string;
  balances: CombinedBalanceInfo[];
  isBalancesLoading: boolean;
  refetchBalances: () => void;
  isOpen: boolean;
  refetchHistory: () => void;
  selectedDenom?: string;
  setOpen?: (isOpen: boolean) => void;
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
}: SendModalProps) {
  const handleClose = () => {
    if (setOpen) {
      setOpen(false);
    }
    (document.getElementById(modalId) as HTMLDialogElement)?.close();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <dialog
      id={modalId}
      className={`modal ${isOpen ? 'modal-open' : ''} z-[999]`}
      onClose={handleClose}
    >
      <div
        className="modal-box max-w-xl mx-auto rounded-[24px] bg-[#F4F4FF] dark:bg-[#1D192D] shadow-lg relative z-[1000]"
        aria-label="send modal"
      >
        <form method="dialog">
          <button
            onClick={handleClose}
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#00000099] dark:text-[#FFFFFF99] hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF1A]"
          >
            ✕
          </button>
        </form>

        <h3 className="text-xl font-semibold text-[#161616] dark:text-white mb-6">Send Assets</h3>

        <SendBox
          address={address}
          balances={balances}
          isBalancesLoading={isBalancesLoading}
          refetchBalances={refetchBalances}
          refetchHistory={refetchHistory}
          selectedDenom={selectedDenom}
        />
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={handleClose}>close</button>
      </form>
    </dialog>
  );
}
