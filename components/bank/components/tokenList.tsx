import React, { useState, useMemo } from 'react';
import { DenomImage } from '@/components/factory';
import { shiftDigits } from '@/utils';
import { CombinedBalanceInfo } from '@/utils/types';
import { DenomInfoModal } from '@/components/factory';
import { PiMagnifyingGlass } from 'react-icons/pi';
import { ArrowUpIcon } from '@/components/icons';
import { truncateString } from '@/utils';
interface TokenListProps {
  balances: CombinedBalanceInfo[] | undefined;
  isLoading: boolean;
}

export default function TokenList({ balances, isLoading }: TokenListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDenom, setSelectedDenom] = useState<any>(null);

  const filteredBalances = useMemo(() => {
    if (!Array.isArray(balances)) return [];
    return balances.filter(balance =>
      balance.metadata?.display.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [balances, searchTerm]);

  const openModal = (denom: any) => {
    setSelectedDenom(denom);
    const modal = document.getElementById('denom-info-modal') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  };

  return (
    <div className="w-full mx-auto rounded-[24px] md:p-0 lg:p-6 mt-12 lg:mt-0">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-[#161616] dark:text-white block lg:hidden xl:block">
          Your assets
        </h3>
        <h3 className="text-xl font-semibold text-[#161616] dark:text-white hidden lg:block xl:hidden">
          Assets
        </h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Search for a token..."
            className="input input-md w-64 lg:w-44 xl:w-64 pr-8 bg-[#0000000A] dark:bg-[#FFFFFF0F]  text-[#161616] dark:text-white placeholder-[#00000099] dark:placeholder-[#FFFFFF99] focus:outline-none focus:ring-0"
            style={{ borderRadius: '12px' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <PiMagnifyingGlass className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#00000099] dark:text-[#FFFFFF99]" />
        </div>
      </div>

      {isLoading ? (
        <div aria-label="skeleton-loader" className="skeleton h-[400px] w-full"></div>
      ) : filteredBalances.length === 0 ? (
        <div className="flex items-center justify-center h-[200px] w-full bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] rounded-[16px]">
          <p className="text-center text-[#00000099] dark:text-[#FFFFFF99]">No tokens found!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-screen overflow-y-auto">
          {filteredBalances.map(balance => (
            <div
              key={balance.denom}
              className="flex flex-row justify-between gap-4 items-center p-4 bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] rounded-[16px] cursor-pointer hover:bg-[#FFFFFF66] dark:hover:bg-[#FFFFFF1A] transition-colors"
              onClick={() => openModal(balance.metadata)}
            >
              <div className="flex flex-row gap-4 items-center justify-start">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#0000000A] dark:bg-[#FFFFFF0F] flex items-center justify-center">
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
              <div className="text-center">
                <p className="font-semibold text-[#161616] dark:text-white">
                  {shiftDigits(
                    balance.amount,
                    -Number(balance.metadata?.denom_units[1]?.exponent) ?? 6
                  )}{' '}
                  {truncateString(balance.metadata?.display ?? '', 12)}
                </p>
              </div>
              <div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    openModal(balance.metadata);
                  }}
                  className="p-2 rounded-md bg-[#0000000A] dark:bg-[#FFFFFF0F] hover:bg-[#FFFFFF66] dark:hover:bg-[#FFFFFF33] transition-colors"
                >
                  <ArrowUpIcon className="w-4 h-4 text-primary" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DenomInfoModal */}
      {selectedDenom && <DenomInfoModal denom={selectedDenom} modalId="denom-info-modal" />}
    </div>
  );
}
