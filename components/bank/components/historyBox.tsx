import React, { useState } from "react";
import { TruncatedAddressWithCopy } from "@/components/react/addressCopy";
import TxInfoModal from "../modals/txInfo";
import { shiftDigits } from "@/utils";
import { formatDenom } from "@/components";

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

  function formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const openModal = (tx: TransactionGroup) => {
    setSelectedTx(tx);
  };

  const closeModal = () => {
    setSelectedTx(null);
  };

  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full">
      <div className="rounded-md w-full justify-center shadow bg-base-200 items-center mx-auto transition-opacity duration-300 ease-in-out animate-fadeIn">
        <div className="rounded-md px-4 py-2 bg-base-100 max-h-[18rem] min-h-[18rem]">
          <div className="px-4 py-2 flex flex-row justify-between items-center border-base-content">
            <h3 className="text-lg font-bold leading-6">Tx History</h3>
          </div>
          <div className="divider  -mt-2 mb-1"></div>
          {send?.length > 0 ? (
            <div className="overflow-x-auto relative shadow-md rounded-lg bg-base-300 max-h-[13rem] min-h-[13rem] transition-opacity duration-300 ease-in-out animate-fadeIn">
              <table className="table w-full table-fixed rounded-md">
                <thead className="sticky top-0 z-1 bg-base-300">
                  <tr>
                    <th className="px-6 py-3 w-1/4">Date</th>
                    <th className="px-6 py-3 w-1/4">Type</th>
                    <th className="px-6 py-3 w-1/4">Amount</th>
                    <th className="px-6 py-3 w-1/4">Target</th>
                  </tr>
                </thead>
                <tbody className="overflow-y-auto">
                  {send?.map((tx: TransactionGroup) => (
                    <tr
                      key={tx.tx_hash}
                      onClick={() => openModal(tx)}
                      className="cursor-pointer hover:bg-base-200"
                    >
                      <td className="px-6 py-4">
                        {formatDateShort(tx.formatted_date)}
                      </td>
                      <td className="px-6 py-4">
                        {tx.data.from_address === address ? "Send" : "Receive"}
                      </td>
                      <td className="px-6 py-4">
                        {tx.data.amount
                          .map(
                            (amt) =>
                              `${shiftDigits(amt.amount, -6)} ${formatDenom(
                                amt.denom,
                              )}`,
                          )
                          .join(", ")}
                      </td>
                      <td className="px-6 py-4">
                        <TruncatedAddressWithCopy
                          address={
                            tx.data.from_address === address
                              ? tx.data.to_address
                              : tx.data.from_address
                          }
                          slice={6}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center mt-24 underline">
              No transactions found for this account!
            </div>
          )}
        </div>
      </div>
      {selectedTx && (
        <TxInfoModal
          tx={selectedTx}
          isOpen={!!selectedTx}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
