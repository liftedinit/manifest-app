import React, { useMemo, useState } from 'react';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import TxInfoModal from '../modals/txInfo';
import { shiftDigits, truncateString } from '@/utils';
import { BurnIcon, DenomImage, formatDenom, MintIcon } from '@/components';
import { HistoryTxType, useTokenFactoryDenomsMetadata } from '@/hooks';
import { ReceiveIcon, SendIcon } from '@/components/icons';

import useIsMobile from '@/hooks/useIsMobile';

interface Transaction {
  tx_type: HistoryTxType;
  from_address: string;
  to_address: string;
  amount: Array<{ amount: string; denom: string }>;
}

export interface TransactionGroup {
  tx_hash: string;
  block_number: number;
  formatted_date: string;
  data: Transaction;
}

function formatLargeNumber(num: number): string {
  const quintillion = 1e18;
  const quadrillion = 1e15;
  const trillion = 1e12;
  const billion = 1e9;
  const million = 1e6;

  if (num >= quintillion) {
    return `${(num / quintillion).toFixed(2)}QT`;
  } else if (num >= quadrillion) {
    return `${(num / quadrillion).toFixed(2)}Q`;
  } else if (num >= trillion) {
    return `${(num / trillion).toFixed(2)}T`;
  } else if (num >= billion) {
    return `${(num / billion).toFixed(2)}B`;
  } else if (num >= million) {
    return `${(num / million).toFixed(2)}M`;
  }
  return num.toLocaleString();
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
}: {
  isLoading: boolean;
  address: string;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  sendTxs: TransactionGroup[];
  totalPages: number;
  txLoading: boolean;
  isError: boolean;
  refetch: () => void;
}) {
  const [selectedTx, setSelectedTx] = useState<TransactionGroup | null>(null);

  const isLoading = initialLoading || txLoading;

  const { metadatas } = useTokenFactoryDenomsMetadata();

  const isMobile = useIsMobile();
  const skeletonGroupCount = 1;
  const skeletonTxCount = isMobile ? 5 : 9;

  function formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  const groupedTransactions = useMemo(() => {
    if (!sendTxs || sendTxs.length === 0) return {};

    const groups: { [key: string]: TransactionGroup[] } = {};
    sendTxs.forEach((tx: TransactionGroup) => {
      const date = formatDateShort(tx.formatted_date);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(tx);
    });

    return groups;
  }, [sendTxs]);

  function getTransactionIcon(tx: TransactionGroup, address: string) {
    if (tx.data.tx_type === HistoryTxType.SEND) {
      return tx.data.from_address === address ? <SendIcon /> : <ReceiveIcon />;
    } else if (tx.data.tx_type === HistoryTxType.MINT || tx.data.tx_type === HistoryTxType.PAYOUT) {
      return (
        <MintIcon
          className={`w-6 h-6 p-1 border-[#00FFAA] border-opacity-[0.12] border-[1.5px] bg-[#00FFAA] bg-opacity-[0.06] rounded-sm text-green-500`}
        />
      );
    } else if (
      tx.data.tx_type === HistoryTxType.BURN ||
      tx.data.tx_type === HistoryTxType.BURN_HELD_BALANCE
    ) {
      return (
        <BurnIcon className="w-6 h-6 p-1 border-[#F54562] border-[1.5px] border-opacity-[0.12] bg-[#f54562] bg-opacity-[0.06] rounded-sm text-red-500" />
      );
    }
    return null;
  }

  // Get the history message based on the transaction type
  function getTransactionMessage(tx: TransactionGroup, address: string) {
    if (tx.data.tx_type === HistoryTxType.SEND) {
      return tx.data.from_address === address ? 'Sent' : 'Received';
    } else if (tx.data.tx_type === HistoryTxType.MINT || tx.data.tx_type === HistoryTxType.PAYOUT) {
      return 'Minted';
    } else if (
      tx.data.tx_type === HistoryTxType.BURN ||
      tx.data.tx_type === HistoryTxType.BURN_HELD_BALANCE
    ) {
      return 'Burned';
    }
    return 'Unsupported';
  }

  // Get the transaction direction based on the transaction type
  function getTransactionPlusMinus(tx: TransactionGroup, address: string) {
    if (tx.data.tx_type === HistoryTxType.SEND) {
      return tx.data.from_address === address ? '-' : '+';
    } else if (tx.data.tx_type === HistoryTxType.MINT || tx.data.tx_type === HistoryTxType.PAYOUT) {
      return '+';
    } else if (
      tx.data.tx_type === HistoryTxType.BURN ||
      tx.data.tx_type === HistoryTxType.BURN_HELD_BALANCE
    ) {
      return '-';
    }
    return '!!';
  }

  // Get the transaction color based on the transaction type and direction
  function getTransactionColor(tx: TransactionGroup, address: string) {
    if (tx.data.tx_type === HistoryTxType.SEND) {
      return tx.data.from_address === address ? 'text-red-500' : 'text-green-500';
    } else if (tx.data.tx_type === HistoryTxType.MINT || tx.data.tx_type === HistoryTxType.PAYOUT) {
      return 'text-green-500';
    } else if (
      tx.data.tx_type === HistoryTxType.BURN ||
      tx.data.tx_type === HistoryTxType.BURN_HELD_BALANCE
    ) {
      return 'text-red-500';
    }
    return null;
  }

  return (
    <div className="w-full mx-auto rounded-[24px] h-full flex flex-col">
      <div className="flex items-center justify-between ">
        <h3 className="text-lg md:text-xl font-semibold text-[#161616] dark:text-white">
          Transaction History
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
              className="p-2 hover:bg-[#0000001A] dark:hover:bg-[#FFFFFF1A] text-black dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex-1 overflow-hidden h-full">
          <div aria-label="skeleton" className="space-y-4">
            {[...Array(skeletonGroupCount)].map((_, groupIndex) => (
              <div key={groupIndex}>
                <div className="skeleton h-4 w-24 mb-2"></div>
                <div className="space-y-2">
                  {[...Array(skeletonTxCount)].map((_, txIndex) => (
                    <div
                      key={txIndex}
                      className="flex items-center justify-between p-4 bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] rounded-[16px] min-h-[80px]"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="skeleton w-8 h-8 rounded-full"></div>
                        <div className="skeleton w-10 h-10 rounded-full"></div>
                        <div>
                          <div className="skeleton h-4 w-24 mb-2"></div>
                          <div className="skeleton h-3 w-32"></div>
                        </div>
                      </div>
                      <div className="skeleton h-4 w-32"></div>
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
            <div className="h-full overflow-y-auto">
              {Object.entries(groupedTransactions).map(([date, transactions], index) => (
                <div key={index}>
                  <h4 className="text-sm font-medium text-[#00000099] dark:text-[#FFFFFF99] mb-1 ml-1 mt-2">
                    {date}
                  </h4>
                  <div className="space-y-2">
                    {transactions.map(tx => (
                      <div
                        key={tx.tx_hash}
                        className="flex items-center justify-between p-4 bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] rounded-[16px] cursor-pointer hover:bg-[#FFFFFF66] dark:hover:bg-[#FFFFFF1A] transition-colors"
                        onClick={() => {
                          setSelectedTx(tx);
                          (
                            document?.getElementById(`tx_modal_info`) as HTMLDialogElement
                          )?.showModal();
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                            {getTransactionIcon(tx, address)}
                          </div>
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-[#0000000A] dark:bg-[#FFFFFF0F] flex items-center justify-center">
                            {tx.data.amount.map((amt, index) => {
                              const metadata = metadatas?.metadatas.find(m => m.base === amt.denom);
                              return <DenomImage key={index} denom={metadata} />;
                            })}
                          </div>
                          <div className="">
                            <div className="flex flex-row items-center gap-2">
                              <p className="font-semibold text-[#161616] dark:text-white">
                                {getTransactionMessage(tx, address)}
                              </p>
                              <p className="font-semibold text-[#161616] dark:text-white">
                                {tx.data.amount.map((amt, index) => {
                                  const metadata = metadatas?.metadatas.find(
                                    m => m.base === amt.denom
                                  );
                                  return metadata?.display.startsWith('factory')
                                    ? metadata?.display?.split('/').pop()?.toUpperCase()
                                    : truncateString(
                                        metadata?.display ?? metadata?.symbol ?? '',
                                        10
                                      ).toUpperCase();
                                })}
                              </p>
                            </div>
                            <div className="address-copy" onClick={e => e.stopPropagation()}>
                              {tx.data.from_address.startsWith('manifest1') ? (
                                <TruncatedAddressWithCopy
                                  address={
                                    tx.data.from_address === address
                                      ? tx.data.to_address
                                      : tx.data.from_address
                                  }
                                  slice={6}
                                />
                              ) : (
                                <div className="text-[#00000099]  dark:text-[#FFFFFF99]">
                                  {tx.data.from_address}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${getTransactionColor(tx, address)}`}>
                            {getTransactionPlusMinus(tx, address)}
                            {tx.data.amount
                              .map(amt => {
                                const metadata = metadatas?.metadatas.find(
                                  m => m.base === amt.denom
                                );
                                const exponent = Number(metadata?.denom_units[1]?.exponent) || 6;
                                const amount = Number(shiftDigits(amt.amount, -exponent));

                                return `${formatLargeNumber(amount)} ${formatDenom(amt.denom)}`;
                              })
                              .join(', ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <TxInfoModal modalId={`tx_modal_info`} tx={selectedTx ?? ({} as TransactionGroup)} />
    </div>
  );
}
