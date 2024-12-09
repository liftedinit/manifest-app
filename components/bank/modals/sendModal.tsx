import React from 'react';
import SendBox from '../components/sendBox';
import { CombinedBalanceInfo } from '@/utils/types';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

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
  isGroup?: boolean;
  admin?: string;
  refetchProposals?: () => void;
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

  const modalContent = (
    <dialog
      id={modalId}
      className={`modal ${isOpen ? 'modal-open' : ''}`}
      onClose={handleClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'transparent',
        padding: 0,
        margin: 0,
        height: '100vh',
        width: '100vw',
        display: isOpen ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="modal-box max-w-xl mx-auto rounded-[24px] bg-[#F4F4FF] dark:bg-[#1D192D] shadow-lg relative"
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
          isGroup={isGroup}
          admin={admin}
          refetchProposals={refetchProposals}
        />
      </div>
      <form
        method="dialog"
        className="modal-backdrop"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}
      >
        <button onClick={handleClose}>close</button>
      </form>
    </dialog>
  );

  // Only render if we're in the browser
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}
