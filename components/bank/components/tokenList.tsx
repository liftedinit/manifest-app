import React, { useEffect, useMemo, useState } from 'react';

import { TokenBalance } from '@/components';
import SendModal from '@/components/bank/modals/sendModal';
import { DenomDisplay, DenomInfoModal } from '@/components/factory';
import { QuestionIcon, SendTxIcon } from '@/components/icons';
import { Pagination } from '@/components/react/Pagination';
import { truncateString } from '@/utils';
import { CombinedBalanceInfo } from '@/utils/types';

interface TokenListProps {
  balances: CombinedBalanceInfo[] | undefined;
  isLoading: boolean;
  address: string;
  pageSize: number;
  isGroup?: boolean;
  admin?: string;
  searchTerm?: string;
}

export const TokenList = ({
  balances,
  isLoading,
  address,
  pageSize,
  isGroup,
  admin,
  searchTerm = '',
}: Readonly<TokenListProps>) => {
  const [selectedDenomBase, setSelectedDenomBase] = useState<any>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [openDenomInfoModal, setOpenDenomInfoModal] = useState(false);

  let filteredBalances = !Array.isArray(balances)
    ? []
    : balances.filter(balance =>
        balance.metadata?.display.toLowerCase().includes(searchTerm.toLowerCase())
      );

  filteredBalances = [...filteredBalances, ...filteredBalances, ...filteredBalances];
  filteredBalances = [...filteredBalances, ...filteredBalances, ...filteredBalances];
  filteredBalances = [...filteredBalances, ...filteredBalances, ...filteredBalances];
  filteredBalances = [...filteredBalances, ...filteredBalances, ...filteredBalances];
  filteredBalances = [...filteredBalances, ...filteredBalances, ...filteredBalances];

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

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
    <div className="w-full mx-auto rounded-[24px] h-full flex flex-col" data-testid="tokenList">
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2" aria-label="skeleton-loader">
            {skeletonItems}
          </div>
        ) : filteredBalances.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] w-full bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] rounded-[16px]">
            <p className="text-center text-[#00000099] dark:text-[#FFFFFF99]">No tokens found!</p>
          </div>
        ) : (
          <Pagination
            pageSize={pageSize}
            dataset={filteredBalances}
            className="space-y-2"
            selectedPage={currentPage}
          >
            {data =>
              data.map(balance => (
                <div
                  key={balance.base}
                  aria-label={balance.base}
                  className="flex flex-row justify-between gap-4 items-center p-4 bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] rounded-[16px] cursor-pointer hover:bg-[#FFFFFF66] dark:hover:bg-[#FFFFFF1A] transition-colors"
                  onClick={() => {
                    setSelectedDenomBase(balance?.base);
                    setOpenDenomInfoModal(true);
                  }}
                >
                  <div className="flex flex-row gap-4 items-center justify-start">
                    <DenomDisplay metadata={balance.metadata} />
                  </div>
                  <div className="text-center hidden sm:block md:block lg:block xl:block">
                    <TokenBalance
                      token={balance}
                      denom={balance.metadata && truncateString(balance.metadata?.display, 12)}
                    />
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
                        className="btn btn-md bg-base-300 text-primary btn-square group-hover:bg-secondary hover:outline hover:outline-primary hover:outline-1 outline-hidden"
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
                        className="btn btn-md bg-base-300 text-primary btn-square group-hover:bg-secondary hover:outline hover:outline-primary hover:outline-1 outline-hidden"
                      >
                        <SendTxIcon className="w-7 h-7 text-current" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            }
          </Pagination>
        )}
      </div>

      <DenomInfoModal
        denom={filteredBalances.find(b => b.base === selectedDenomBase)?.metadata ?? null}
        open={openDenomInfoModal}
        onClose={() => setOpenDenomInfoModal(false)}
      />

      <SendModal
        address={address}
        balances={balances ?? ([] as CombinedBalanceInfo[])}
        isBalancesLoading={isLoading}
        selectedDenom={selectedDenomBase}
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        isGroup={isGroup}
        admin={admin}
      />
    </div>
  );
};
