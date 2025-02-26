import { ChainContext } from '@cosmos-kit/core';
import React, { useEffect, useMemo, useState } from 'react';

import SendModal from '@/components/bank/modals/sendModal';
import { DenomDisplay, DenomImage, DenomInfoModal } from '@/components/factory';
import { QuestionIcon, SendTxIcon, VerifiedIcon } from '@/components/icons';
import { shiftDigits, truncateString } from '@/utils';
import { CombinedBalanceInfo } from '@/utils/types';

interface TokenListProps {
  balances: CombinedBalanceInfo[] | undefined;
  isLoading: boolean;
  refetchBalances: () => void;
  refetchHistory: () => void;
  address: string;
  pageSize: number;
  isGroup?: boolean;
  admin?: string;
  refetchProposals?: () => void;
  searchTerm?: string;
}

export const TokenList = React.memo(function TokenList(props: Readonly<TokenListProps>) {
  const {
    balances,
    isLoading,
    refetchBalances,
    refetchHistory,
    address,
    pageSize,
    isGroup,
    admin,
    refetchProposals,
    searchTerm = '',
  } = props;
  const [selectedDenomBase, setSelectedDenomBase] = useState<any>(null);
  const [isSendModalOpen, setIsSendModalOpenHook] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDenomInfoModal, setOpenDenomInfoModal] = useState(false);

  function setIsSendModalOpen(isOpen: boolean) {
    setIsSendModalOpenHook(isOpen);
  }

  const filteredBalances = useMemo(() => {
    if (!Array.isArray(balances)) return [];
    return balances.filter(balance =>
      balance.metadata?.display.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [balances, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredBalances.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const paginatedBalances = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredBalances.slice(startIndex, startIndex + pageSize);
  }, [filteredBalances, currentPage, pageSize]);

  const skeletonItems = useMemo(
    () =>
      [...Array(pageSize)].map((_, i) => (
        <div
          key={i}
          className="flex flex-row justify-between gap-4 items-center p-4 bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] rounded-[16px]"
        >
          <div className="flex flex-row gap-4 items-center justify-start">
            <div className="skeleton w-11 h-11 rounded-md" />
            <div className="space-y-1">
              <div className="skeleton h-4 w-20" />
              <div className="skeleton h-3 w-14" />
            </div>
          </div>
          <div className="text-center hidden sm:block md:block lg:hidden xl:block">
            <div className="skeleton h-4 w-28" />
          </div>
          <div className="flex flex-row gap-2">
            <div className="skeleton w-8 h-8 rounded-md" />
            <div className="skeleton w-8 h-8 rounded-md" />
          </div>
        </div>
      )),
    [pageSize]
  );

  return (
    <div className="w-full mx-auto rounded-[24px] h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2" aria-label="skeleton-loader">
            {skeletonItems}
          </div>
        ) : paginatedBalances.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] w-full bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] rounded-[16px]">
            <p className="text-center text-[#00000099] dark:text-[#FFFFFF99]">No tokens found!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {paginatedBalances.map(balance => (
              <div
                key={balance.display}
                aria-label={balance.display}
                className="flex flex-row justify-between gap-4 items-center p-4 bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] rounded-[16px] cursor-pointer hover:bg-[#FFFFFF66] dark:hover:bg-[#FFFFFF1A] transition-colors"
                onClick={() => {
                  setSelectedDenomBase(balance?.base);
                  setOpenDenomInfoModal(true);
                }}
              >
                <div className="flex flex-row gap-4 items-center justify-start">
                  <DenomDisplay metadata={balance.metadata} />
                </div>
                <div className="text-center hidden sm:block md:block lg:hidden xl:block">
                  <p className="font-semibold text-[#161616] dark:text-white">
                    {Number(
                      shiftDigits(
                        balance.amount,
                        -(balance.metadata?.denom_units[1]?.exponent ?? 6)
                      )
                    ).toLocaleString(undefined, {
                      maximumFractionDigits: balance.metadata?.denom_units[1]?.exponent ?? 6,
                    })}{' '}
                    <span>{truncateString(balance.metadata?.display ?? '', 12).toUpperCase()}</span>
                  </p>
                </div>
                <div className="flex flex-row gap-2">
                  <div
                    className="tooltip tooltip-left tooltip-primary hover:after:delay-1000 hover:before:delay-1000"
                    data-tip="Token Details"
                  >
                    <button
                      aria-label={`info-${balance?.display}`}
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedDenomBase(balance?.base);
                        setOpenDenomInfoModal(true);
                      }}
                      className="btn btn-md bg-base-300 text-primary btn-square group-hover:bg-secondary hover:outline hover:outline-primary hover:outline-1 outline-none"
                    >
                      <QuestionIcon className="w-7 h-7 text-current" />
                    </button>
                  </div>
                  <div
                    className="tooltip tooltip-left tooltip-primary hover:after:delay-1000 hover:before:delay-1000"
                    data-tip="Send Tokens"
                  >
                    <button
                      aria-label={`send-${balance?.display}`}
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedDenomBase(balance?.base);
                        setIsSendModalOpen(true);
                      }}
                      className="btn btn-md bg-base-300 text-primary btn-square group-hover:bg-secondary hover:outline hover:outline-primary hover:outline-1 outline-none"
                    >
                      <SendTxIcon className="w-7 h-7 text-current" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Token list pagination"
          className="flex items-center justify-end gap-2 mt-4"
        >
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isLoading}
            aria-label="Go to previous page"
            className="p-2 hover:bg-[#0000001A] dark:hover:bg-[#FFFFFF1A] text-black dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ‹
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
            ) {
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  aria-current={currentPage === pageNum ? 'page' : undefined}
                  aria-label={`Page ${pageNum}`}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors
                    ${
                      currentPage === pageNum
                        ? 'bg-[#0000001A] dark:bg-[#FFFFFF1A] text-black dark:text-white'
                        : 'hover:bg-[#0000001A] dark:hover:bg-[#FFFFFF1A] text-black dark:text-white'
                    }`}
                >
                  {pageNum}
                </button>
              );
            } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
              return (
                <span key={pageNum} className="text-black dark:text-white" aria-hidden="true">
                  ...
                </span>
              );
            }
            return null;
          })}

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || isLoading}
            aria-label="Go to next page"
            className="p-2 hover:bg-[#0000001A] dark:hover:bg-[#FFFFFF1A] text-black dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ›
          </button>
        </nav>
      )}

      <DenomInfoModal
        denom={filteredBalances.find(b => b.base === selectedDenomBase)?.metadata ?? null}
        modalId="denom-info-modal"
        openDenomInfoModal={openDenomInfoModal}
        setOpenDenomInfoModal={setOpenDenomInfoModal}
      />
      <SendModal
        address={address}
        balances={balances ?? ([] as CombinedBalanceInfo[])}
        isBalancesLoading={isLoading}
        refetchBalances={refetchBalances}
        refetchHistory={refetchHistory}
        selectedDenom={selectedDenomBase}
        isOpen={isSendModalOpen}
        setOpen={setIsSendModalOpen}
        isGroup={isGroup}
        admin={admin}
        refetchProposals={refetchProposals}
      />
    </div>
  );
});
