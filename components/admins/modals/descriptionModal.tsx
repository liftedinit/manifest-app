import React from "react";
import { PiWarning } from "react-icons/pi";

interface DescriptionModalProps {
  modalId: string;
  details: string;
  type?: "group" | "validator";
}

export function DescriptionModal({
  modalId,
  details,
  type,
}: DescriptionModalProps) {
  return (
    <dialog id={modalId} className="modal max-w-md mx-auto">
      <form method="dialog" className="modal-box ">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>
        <h3 className="font-bold text-lg">
          {type === "validator" ? "Validator" : "Group"}&nbsp;Description
        </h3>
        <div className="divider divider-horizon -mt-0 -mb-2"></div>
        <div className="py-4 flex flex-col gap-4">
          <p className="">{details}</p>
        </div>
      </form>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
