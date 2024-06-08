import React from "react";
import { PiWarning } from "react-icons/pi";

interface WarningModalProps {
  isActive: boolean;
  address: string;
  moniker: string;
  modalId: string;
  onAccept: () => void;
}

export function WarningModal({
  moniker,
  modalId,
  onAccept,
  isActive,
}: WarningModalProps) {
  return (
    <dialog id={modalId} className="modal">
      <form method="dialog" className="modal-box">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>
        <div className="p-4 ">
          <div className="flex flex-col gap-2 items-center mb-6">
            <PiWarning className="text-yellow-200 text-6xl" />
          </div>
          <p className="text-md text-center font-thin">
            Are you sure you want to remove the validator{" "}
          </p>
          <p className="text-center font-bold text-2xl mt-2">{moniker}</p>
          <p className="text-md text-center font-thin mt-2">
            from the {isActive ? "active" : "pending"} list?
          </p>
        </div>

        <div className="modal-action">
          <button
            type="button"
            className="btn btn-secondary w-1/2 mx-auto -mt-2"
            onClick={onAccept}
          >
            {isActive ? "Remove From Active Set" : "Remove From Pending List"}
          </button>
        </div>
      </form>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
