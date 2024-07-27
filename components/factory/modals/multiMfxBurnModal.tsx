import React from "react";
import { PiPlusCircle, PiMinusCircle } from "react-icons/pi";

interface BurnPair {
  address: string;
  amount: string;
}

interface MultiBurnModalProps {
  isOpen: boolean;
  onClose: () => void;
  burnPairs: BurnPair[];
  updateBurnPair: (
    index: number,
    field: "address" | "amount",
    value: string
  ) => void;
  addBurnPair: () => void;
  removeBurnPair: (index: number) => void;
  handleMultiBurn: () => void;
  isSigning: boolean;
}

export function MultiBurnModal({
  isOpen,
  onClose,
  burnPairs,
  updateBurnPair,
  addBurnPair,
  removeBurnPair,
  handleMultiBurn,
  isSigning,
}: MultiBurnModalProps) {
  return (
    <dialog
      id="multi_burn_modal"
      className={`modal ${isOpen ? "modal-open" : ""}`}
    >
      <div className="modal-box max-w-3xl">
        <h3 className="font-bold text-2xl mb-4">Multi Burn MFX</h3>
        <div className="divider -mt-4"></div>
        <div className="max-h-96 overflow-y-auto bg-base-200 p-6 rounded-lg">
          {burnPairs.map((pair, index) => (
            <div
              key={index}
              className="flex h-[5rem] flex-col md:flex-row justify-between items-center gap-2 mb-6 bg-base-100 p-4 rounded-lg shadow"
            >
              <div className="w-full md:w-1/2">
                <label className="label -mb-2">
                  <span className="label-text font-medium">Target Address</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter address"
                  className="input input-bordered input-sm w-full mb-4"
                  value={pair.address}
                  onChange={(e) =>
                    updateBurnPair(index, "address", e.target.value)
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
                    updateBurnPair(index, "amount", e.target.value)
                  }
                />
              </div>
              <button
                onClick={() =>
                  index === burnPairs.length - 1
                    ? addBurnPair()
                    : removeBurnPair(index)
                }
                className={`btn btn-circle btn-sm ${
                  index === burnPairs.length - 1 ? "btn-secondary" : "btn-error"
                } mt-4 md:mt-0`}
              >
                {index === burnPairs.length - 1 ? (
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
            className="btn btn-secondary"
            onClick={handleMultiBurn}
            disabled={isSigning}
          >
            {isSigning ? (
              <span className="loading loading-dots loading-md"></span>
            ) : (
              "Multi Burn"
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
