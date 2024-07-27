// MultiMintModal.tsx
import React from "react";
import { PiPlusCircle, PiMinusCircle } from "react-icons/pi";

interface PayoutPair {
  address: string;
  amount: string;
}

interface MultiMintModalProps {
  isOpen: boolean;
  onClose: () => void;
  payoutPairs: PayoutPair[];
  updatePayoutPair: (
    index: number,
    field: "address" | "amount",
    value: string
  ) => void;
  addPayoutPair: () => void;
  removePayoutPair: (index: number) => void;
  handleMultiMint: () => void;
  isSigning: boolean;
}

export function MultiMintModal({
  isOpen,
  onClose,
  payoutPairs,
  updatePayoutPair,
  addPayoutPair,
  removePayoutPair,
  handleMultiMint,
  isSigning,
}: MultiMintModalProps) {
  return (
    <dialog
      id="multi_mint_modal"
      className={`modal ${isOpen ? "modal-open" : ""}`}
    >
      <div className="modal-box max-w-3xl">
        <h3 className="font-bold text-2xl mb-4">Multi Mint MFX</h3>
        <div className="divider -mt-4"></div>
        <div className="max-h-96 overflow-y-auto bg-base-200 p-6 rounded-lg">
          {payoutPairs.map((pair, index) => (
            <div
              key={index}
              className="flex h-[5rem] flex-col md:flex-row justify-between items-center gap-2 mb-6 bg-base-100 p-4 rounded-lg shadow"
            >
              <div className="w-full md:w-1/2">
                <label className="label -mb-2">
                  <span className="label-text font-medium">
                    Recipient Address
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Enter address"
                  className="input input-bordered input-sm w-full mb-4"
                  value={pair.address}
                  onChange={(e) =>
                    updatePayoutPair(index, "address", e.target.value)
                  }
                />
              </div>
              <div className="w-full md:w-1/3">
                <label className="label -mb-2">
                  <span className="label-text font-medium">Amount</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter amount"
                  className="input input-bordered input-sm w-full mb-4"
                  value={pair.amount}
                  onChange={(e) =>
                    updatePayoutPair(index, "amount", e.target.value)
                  }
                />
              </div>
              <button
                onClick={() =>
                  index === payoutPairs.length - 1
                    ? addPayoutPair()
                    : removePayoutPair(index)
                }
                className={`btn btn-circle btn-sm ${
                  index === payoutPairs.length - 1 ? "btn-primary" : "btn-error"
                } mt-4 md:mt-0`}
              >
                {index === payoutPairs.length - 1 ? (
                  <PiPlusCircle className="w-6 h-6" />
                ) : (
                  <PiMinusCircle className="w-6 h-6" />
                )}
              </button>
            </div>
          ))}
        </div>
        <div className="modal-action mt-6">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleMultiMint}
            disabled={isSigning}
          >
            {isSigning ? (
              <span className="loading loading-dots loading-md"></span>
            ) : (
              "Multi Mint"
            )}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
