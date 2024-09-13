import React, { useState, useMemo } from 'react';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import TxInfoModal from '../modals/txInfo';
import { shiftDigits } from '@/utils';
import { formatDenom } from '@/components';
import { useTokenFactoryDenomsMetadata } from '@/hooks';
import { SendIcon, ReceiveIcon } from '@/components/icons';

import { DenomImage } from '@/components';
interface Transaction {
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

export function HistoryBox({
  isLoading,
  send,
  address,
}: {
  isLoading: boolean;
  send: TransactionGroup[];
  address: string;
}) {
  const [selectedTx, setSelectedTx] = useState<TransactionGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { metadatas } = useTokenFactoryDenomsMetadata();

  function formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  const openModal = (tx: TransactionGroup) => {
    setSelectedTx(tx);
  };

  const closeModal = () => {
    setSelectedTx(null);
  };

  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: TransactionGroup[] } = {};
    send.forEach(tx => {
      const date = formatDateShort(tx.formatted_date);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(tx);
    });
    return groups;
  }, [send]);

  const handleTxClick = (event: React.MouseEvent, tx: TransactionGroup) => {
    if (!(event.target as HTMLElement).closest('.address-copy')) {
      openModal(tx);
    }
  };

  return (
    <div className="w-full mx-auto rounded-[24px] mt-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-[#161616] dark:text-white">
          Transaction History
        </h3>
      </div>

      {isLoading ? (
        <div className="skeleton h-[400px] w-full"></div>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {Object.entries(groupedTransactions).map(([date, transactions]) => (
            <div key={date}>
              <h4 className="text-sm font-medium text-[#00000099] dark:text-[#FFFFFF99] mb-2">
                {date}
              </h4>
              <div className="space-y-2">
                {transactions.map((tx: TransactionGroup) => (
                  <div
                    key={tx.tx_hash}
                    onClick={e => handleTxClick(e, tx)}
                    className="flex items-center justify-between p-4 bg-[#FFFFFF33] dark:bg-[#FFFFFF0F] rounded-[16px] cursor-pointer hover:bg-[#FFFFFF66] dark:hover:bg-[#FFFFFF1A] transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                        {tx.data.from_address === address ? <SendIcon /> : <ReceiveIcon />}
                      </div>
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#FFFFFF33] dark:bg-[#FFFFFF1A] flex items-center justify-center">
                        {tx.data.amount.map((amt, index) => {
                          const metadata = metadatas?.metadatas.find(m => m.base === amt.denom);

                          return <DenomImage key={index} denom={metadata} />;
                        })}
                      </div>
                      <div>
                        <p className="font-semibold text-[#161616] dark:text-white">
                          {tx.data.from_address === address ? 'Sent' : 'Received'}
                        </p>
                        <div className="address-copy">
                          <TruncatedAddressWithCopy
                            address={
                              tx.data.from_address === address
                                ? tx.data.to_address
                                : tx.data.from_address
                            }
                            slice={6}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${tx.data.from_address === address ? 'text-red-500' : 'text-green-500'}`}
                      >
                        {tx.data.from_address === address ? '-' : '+'}
                        {tx.data.amount
                          .map(amt => {
                            const metadata = metadatas?.metadatas.find(m => m.base === amt.denom);
                            const exponent = Number(metadata?.denom_units[1]?.exponent) || 6;
                            return `${shiftDigits(amt.amount, -exponent)} ${formatDenom(amt.denom)}`;
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

      {selectedTx && <TxInfoModal tx={selectedTx} isOpen={!!selectedTx} onClose={closeModal} />}
    </div>
  );
}
