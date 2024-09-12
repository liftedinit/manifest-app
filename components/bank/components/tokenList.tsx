import React, { useState, useMemo } from 'react';
import { DenomImage } from '@/components/factory';
import { shiftDigits } from '@/utils';
import { CombinedBalanceInfo } from '@/pages/bank';
import { DenomInfoModal } from '@/components/factory';
import { PiMagnifyingGlass } from 'react-icons/pi';

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
    <div className="w-full mx-auto rounded-[24px] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-[#161616] dark:text-white">Your assets</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Search for a token..."
            className="input input-md w-64 pr-8 bg-[#FFFFFF1F] dark:bg-[#FFFFFF1F]  text-[#161616] dark:text-white placeholder-[#00000099] dark:placeholder-[#FFFFFF99] focus:outline-none focus:ring-0"
            style={{ borderRadius: '12px' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <PiMagnifyingGlass className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#00000099] dark:text-[#FFFFFF99]" />
        </div>
      </div>

      {isLoading ? (
        <div className="skeleton h-[400px] w-full"></div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredBalances.map(balance => (
            <div
              key={balance.denom}
              className="flex items-center justify-between p-4 bg-[#FFFFFF33] dark:bg-[#FFFFFF0F] rounded-[16px] cursor-pointer hover:bg-[#FFFFFF66] dark:hover:bg-[#FFFFFF1A] transition-colors"
              onClick={() => openModal(balance.metadata)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#FFFFFF33] dark:bg-[#FFFFFF1A] flex items-center justify-center">
                  <DenomImage denom={balance.metadata} />
                </div>
                <div>
                  <p className="font-semibold text-[#161616] dark:text-white">
                    {balance.metadata?.display}
                  </p>
                  <p className="text-sm text-[#00000099] dark:text-[#FFFFFF99]">
                    {balance.metadata?.symbol}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#161616] dark:text-white">
                  {shiftDigits(
                    balance.amount,
                    -Number(balance.metadata?.denom_units[1]?.exponent) ?? 6
                  )}{' '}
                  {balance.metadata?.symbol}
                </p>
                <p className="text-sm text-[#00000099] dark:text-[#FFFFFF99]">$3691.01</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">+2.09%</span>
                {/* Replace with actual chart component */}
                <div className="w-[50px] h-[20px] bg-[#FFFFFF33] dark:bg-[#FFFFFF1A] rounded-full"></div>
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
