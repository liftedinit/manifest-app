import React, { useState } from "react";
import { DenomImage } from "@/components/factory";
import { shiftDigits } from "@/utils";
import { CombinedBalanceInfo } from "@/pages/bank";
import { DenomInfoModal } from "@/components/factory"; // Make sure to import this

interface TokenListProps {
  balances: CombinedBalanceInfo[] | undefined;
  isLoading: boolean;
  admin: string;
}

export default function TokenList({
  balances,
  isLoading,
  admin,
}: TokenListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDenom, setSelectedDenom] = useState<any>(null);
  const [isMFX, setIsMFX] = useState<boolean>(false);
  const filteredBalances = React.useMemo(() => {
    if (!Array.isArray(balances)) return [];
    return balances.filter((balance) =>
      balance.denom.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [balances, searchTerm]);

  const openModal = (denom: any) => {
    setSelectedDenom(denom);
    setIsMFX(denom?.base?.includes("mfx"));
    const modal = document.getElementById(
      "denom-info-modal"
    ) as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  };

  return (
    <div className="w-full mx-auto p-4 bg-base-100 rounded-md max-h-[28.7rem] min-h-[28.7rem]">
      <div className="px-4 py-2 border-base-content flex items-center justify-between">
        <div className="relative">
          <h3 className="text-lg font-bold leading-6 ">Your Balances</h3>
        </div>
        <div className="flex flex-row items-center justify-between gap-2">
          <input
            type="text"
            placeholder="Search for a token..."
            className="input input-bordered input-xs ml-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="divider divider-horizon -mt-2 mb-1"></div>
      {isLoading && <div className="skeleton h-[18.9rem] w-full"></div>}
      {filteredBalances.length > 0 && !isLoading && (
        <div className="overflow-x-auto shadow-md rounded-lg bg-base-300 max-h-[23.5rem] min-h-[23.5rem] relative transition-opacity duration-300 ease-in-out animate-fadeIn">
          <table className="table w-full table-fixed rounded-md">
            <thead className="sticky top-0 z-1 bg-base-300">
              <tr>
                <th className="px-6 py-3 w-1/4">Icon</th>
                <th className="px-6 py-3 w-1/4">Name</th>
                <th className="px-6 py-3 w-1/4">Base</th>
                <th className="px-6 py-3 w-1/4">Balance</th>
              </tr>
            </thead>
            <tbody className="overflow-y-auto">
              {filteredBalances.map((balance) => (
                <tr
                  key={balance.denom}
                  className="hover:bg-base-200/10 cursor-pointer"
                  onClick={() => openModal(balance.metadata)}
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <DenomImage denom={balance.metadata} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm font-medium">
                    <span className="block truncate max-w-[20ch]">
                      {balance.metadata?.display.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm font-medium">
                    <span className="block truncate max-w-[20ch]">
                      {Number(balance.metadata?.base.length) < 10
                        ? balance.metadata?.base
                        : balance.metadata?.base.split("/").pop() ?? ""}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    {shiftDigits(
                      balance.amount,
                      -Number(balance.metadata?.denom_units[1]?.exponent) ?? 6
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {filteredBalances.length === 0 && !isLoading && (
        <div className="mx-auto items-center justify-center h-full underline text-center transition-opacity duration-300 ease-in-out animate-fadeIn">
          <p className="my-32">Your wallet is empty!</p>
        </div>
      )}

      {/* DenomInfoModal */}
      {selectedDenom && (
        <DenomInfoModal
          admin={admin}
          isMFX={isMFX}
          denom={selectedDenom}
          modalId="denom-info-modal"
        />
      )}
    </div>
  );
}
