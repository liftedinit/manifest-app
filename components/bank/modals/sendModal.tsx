import React from 'react';
import SendBox from '../components/sendBox';
import { CombinedBalanceInfo } from '@/utils/types';

interface SendModalProps {
  modalId: string;
  address: string;
  balances: CombinedBalanceInfo[];
  isBalancesLoading: boolean;
  refetchBalances: () => void;
  refetchHistory: () => void;
  selectedDenom?: string;
}

export default function SendModal({
  modalId,
  address,
  balances,
  isBalancesLoading,
  refetchBalances,
  refetchHistory,
  selectedDenom,
}: SendModalProps) {
  return (
    <dialog id={modalId} className="modal z-[999]">
      <div
        className="modal-box max-w-xl mx-auto rounded-[24px] bg-[#F4F4FF] dark:bg-[#1D192D] shadow-lg relative z-[1000]"
        aria-label="send modal"
      >
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#00000099] dark:text-[#FFFFFF99] hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF1A]">
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
        <button>close</button>
      </form>
    </dialog>
  );
}
