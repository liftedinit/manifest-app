import React, { useState } from 'react';
import { TransactionAmount, TxMessage } from '../types';
import { shiftDigits, formatLargeNumber, formatDenom } from '@/utils';
import { getHandler } from '@/components/bank/handlers/handlerRegistry';
import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { useTokenFactoryDenomsMetadata } from '@/hooks';
import TxInfoModal from '../modals/txInfo';

export interface TransactionGroup {
  tx_hash: string;
  block_number: number;
  formatted_date: string;
  fee?: TransactionAmount;
  memo?: string;
}

export function HistoryBox({
  isLoading: initialLoading,
  address,
  currentPage,
  setCurrentPage,
  sendTxs,
  totalPages,
  txLoading,
  isError,
  refetch,
  skeletonGroupCount,
  skeletonTxCount,
  isGroup,
}: Readonly<{
  isLoading: boolean;
  address: string;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  sendTxs: TxMessage[];
  totalPages: number;
  txLoading: boolean;
  isError: boolean;
  refetch: () => void;
  skeletonGroupCount: number;
  skeletonTxCount: number;
  isGroup?: boolean;
}>) {
  const [selectedTx, setSelectedTx] = useState<TxMessage | null>(null);
  const { metadatas, isMetadatasLoading } = useTokenFactoryDenomsMetadata();

  const isLoading = initialLoading || txLoading || isMetadatasLoading;

  function formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function getTransactionIcon(tx: TxMessage, address: string) {
    const handler = getHandler(tx.type);
    const { icon: IconComponent } = handler(tx, address);
    return <IconComponent />;
  }

  function getTransactionMessage(tx: TxMessage, address: string, metadata?: MetadataSDKType[]) {
    const handler = getHandler(tx.type);
    return handler(tx, address, metadata).message;
  }

  return (
    <div className="w-full mx-auto rounded-[24px] h-full flex flex-col px-2 sm:px-4">
      {isLoading ? (
        <div className="flex-1 overflow-hidden h-full">
          <div aria-label="skeleton" className="space-y-2">
            {[...Array(skeletonGroupCount)].map((_, groupIndex) => (
              <div key={groupIndex}>
                <div className="space-y-2">
                  {[...Array(skeletonTxCount)].map((_, txIndex) => (
                    <div
                      key={txIndex}
                      className="flex items-center justify-between p-4 bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] rounded-[16px]"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="skeleton w-9 h-9 rounded-full"></div>
                        <div className="skeleton w-11 h-11 rounded-md"></div>
                        <div>
                          <div className="flex flex-row items-center gap-2">
                            <div className="skeleton h-6 w-16"></div>
                            <div className="skeleton h-6 w-12"></div>
                          </div>
                          <div className="skeleton h-5 w-32 mt-1"></div>
                        </div>
                      </div>
                      <div className="skeleton h-4 w-24 hidden sm:block"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden h-full">
          {txLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center h-[200px] w-full bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] rounded-[16px]">
              <p className="text-center text-red-500">Error loading transactions</p>
            </div>
          ) : !sendTxs || sendTxs.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] w-full bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] mt-5 rounded-[16px]">
              <p className="text-center text-[#00000099] dark:text-[#FFFFFF99]">
                No transactions found!
              </p>
            </div>
          ) : (
            <div className="h-full overflow-y-auto space-y-2 mt-2">
              {sendTxs?.slice(0, skeletonTxCount).map((tx, index) => (
                <div
                  key={`${tx.id}-${index}`}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 
                    ${
                      tx.error
                        ? 'bg-[#E5393522] dark:bg-[#E5393533] hover:bg-[#E5393544] dark:hover:bg-[#E5393555]'
                        : 'bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] hover:bg-[#FFFFFF66] dark:hover:bg-[#FFFFFF1A]'
                    }
                    rounded-[16px] cursor-pointer transition-colors`}
                  onClick={() => {
                    setSelectedTx(tx);
                    (document?.getElementById('tx_modal_info') as HTMLDialogElement)?.showModal();
                  }}
                >
                  <div className="flex flex-row items-center space-x-3 mb-2 sm:mb-0">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-[#161616] dark:text-white">
                      {getTransactionIcon(tx, address)}
                    </div>
                    <div>
                      <p className="text-sm text-[#00000099] dark:text-[#FFFFFF99]">
                        {formatDateShort(tx.timestamp)}
                      </p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-1">
                        <span className="font-semibold text-[#161616] dark:text-white">
                          {getTransactionMessage(tx, address, metadatas?.metadatas)}
                        </span>
                      </div>
                      {tx.message_index < 10000 ? (
                        tx.sender === address ? (
                          <div className="text-gray-500 text-xs mt-1">
                            Incl.:{' '}
                            {tx.fee &&
                              formatLargeNumber(
                                Number(shiftDigits(tx.fee.amount?.[0]?.amount, -6))
                              ) +
                                ' ' +
                                formatDenom(tx.fee.amount?.[0]?.denom)}{' '}
                            fee
                          </div>
                        ) : null
                      ) : (
                        <div className="text-gray-500 text-xs mt-1">
                          Fee incl. in proposal #{tx.proposal_ids} execution
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Example of placing date/ID on the right side on larger screens:
                      <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-2 sm:mt-0">
                        Tx ID: {tx.id}
                      </div>
                  */}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-end gap-2 mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isLoading}
            aria-label="Previous page"
            className="p-2 hover:bg-[#0000001A] dark:hover:bg-[#FFFFFF1A] text-black dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ‹
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
            // Only show current page and adjacent pages
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
            ) {
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  aria-label={`Page ${pageNum}`}
                  aria-current={currentPage === pageNum ? 'page' : undefined}
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
                <span className="text-black dark:text-white" key={pageNum}>
                  ...
                </span>
              );
            }
            return null;
          })}

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || isLoading}
            aria-label="Next page"
            className="p-2 hover:bg-[#0000001A] dark:hover:bg-[#FFFFFF1A] text-black dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ›
          </button>
        </div>
      )}

      <TxInfoModal modalId="tx_modal_info" tx={selectedTx ?? ({} as TxMessage)} />
    </div>
  );
}
