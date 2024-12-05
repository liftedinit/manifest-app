import React, { useState, useMemo, useEffect } from 'react';
import { DenomImage } from '@/components/factory';
import { shiftDigits } from '@/utils';
import { CombinedBalanceInfo } from '@/utils/types';
import { DenomInfoModal } from '@/components/factory';
import { PiMagnifyingGlass } from 'react-icons/pi';
import { SendTxIcon, QuestionIcon } from '@/components/icons';
import { truncateString } from '@/utils';
import SendModal from '@/components/bank/modals/sendModal';
import useIsMobile from '@/hooks/useIsMobile';

interface TokenListProps {
  balances: CombinedBalanceInfo[] | undefined;
  isLoading: boolean;
  refetchBalances: () => void;
  refetchHistory: () => void;
  address: string;
}

export default function TokenList({
  balances,
  isLoading,
  refetchBalances,
  refetchHistory,
  address,
}: TokenListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDenom, setSelectedDenom] = useState<any>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const isMobile = useIsMobile();

  const pageSize = isMobile ? 4 : 9;

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

  return (
    <div className="w-full mx-auto rounded-[24px] h-full flex flex-col">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-row items-center justify-between">
          <h3 className="text-lg md:text-xl font-semibold text-[#161616] dark:text-white">
            Your Assets
          </h3>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isLoading}
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
                    <span key={pageNum} className="text-black dark:text-white">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || isLoading}
                className="p-2 hover:bg-[#0000001A] dark:hover:bg-[#FFFFFF1A] text-black dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ›
              </button>
            </div>
          )}
        </div>

        <div className="w-full">
          <input
            type="text"
            placeholder="Search for a token..."
            className="input input-md w-full pr-8 bg-[#0000000A] dark:bg-[#FFFFFF0F]"
            style={{ borderRadius: '12px' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2" aria-label="skeleton-loader">
            {[...Array(pageSize)].map((_, i) => (
              <div
                key={i}
                className="flex flex-row justify-between gap-4 items-center p-4 bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] rounded-[16px] min-h-[80px]"
              >
                <div className="flex flex-row gap-4 items-center justify-start">
                  <div className="skeleton w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-24" />
                    <div className="skeleton h-3 w-16" />
                  </div>
                </div>
                <div className="skeleton h-4 w-32" />
                <div className="flex flex-row gap-2">
                  <div className="skeleton w-8 h-8 rounded-md" />
                  <div className="skeleton w-8 h-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : paginatedBalances.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] w-full bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] rounded-[16px]">
            <p className="text-center text-[#00000099] dark:text-[#FFFFFF99]">No tokens found!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {paginatedBalances.map(balance => (
              <div
                key={balance.denom}
                aria-label={balance.denom}
                className="flex flex-row justify-between gap-4 items-center p-4 bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] rounded-[16px] cursor-pointer hover:bg-[#FFFFFF66] dark:hover:bg-[#FFFFFF1A] transition-colors"
                onClick={() => {
                  setSelectedDenom(balance?.denom);
                  (document?.getElementById(`denom-info-modal`) as HTMLDialogElement)?.showModal();
                }}
              >
                <div className="flex flex-row gap-4 items-center justify-start">
                  <div className="w-10 h-10 rounded-full  bg-[#0000000A] dark:bg-[#FFFFFF0F] flex items-center justify-center">
                    <DenomImage denom={balance.metadata} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#161616] dark:text-white">
                      {truncateString(balance.metadata?.display ?? '', 12)}
                    </p>
                    <p className="text-sm text-[#00000099] dark:text-[#FFFFFF99]">
                      {balance.metadata?.denom_units[0]?.denom.split('/').pop()}
                    </p>
                  </div>
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
                  <button
                    aria-label={`info-${balance?.denom}`}
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedDenom(balance?.denom);
                      (
                        document?.getElementById(`denom-info-modal`) as HTMLDialogElement
                      )?.showModal();
                    }}
                    className="p-2 rounded-md bg-[#0000000A] dark:bg-[#FFFFFF0F] hover:bg-[#FFFFFF66] dark:hover:bg-[#FFFFFF33] transition-colors"
                  >
                    <QuestionIcon className="w-4 h-4 text-primary" />
                  </button>
                  <button
                    aria-label={`send-${balance?.denom}`}
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedDenom(balance?.denom);
                      setIsSendModalOpen(true);
                    }}
                    className="p-2 rounded-md bg-[#0000000A] dark:bg-[#FFFFFF0F] hover:bg-[#FFFFFF66] dark:hover:bg-[#FFFFFF33] transition-colors"
                  >
                    <SendTxIcon className="w-4 h-4 text-primary" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DenomInfoModal
        denom={filteredBalances.find(b => b.denom === selectedDenom)?.metadata ?? null}
        modalId="denom-info-modal"
      />
      <SendModal
        modalId="send-modal"
        isOpen={isSendModalOpen}
        address={address}
        balances={balances ?? []}
        isBalancesLoading={isLoading}
        refetchBalances={refetchBalances}
        refetchHistory={refetchHistory}
        selectedDenom={selectedDenom}
        setOpen={setIsSendModalOpen}
      />
    </div>
  );
}
