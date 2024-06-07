import React from "react";

interface Validator {
  moniker: string;
  power: string;
  address: string;
}

export function ValidatorDetailsModal({
  validator,
  modalId,
}: {
  validator: Validator | null;
  modalId: string;
}) {
  if (!validator) return null;

  return (
    <dialog id={modalId} className="modal">
      <form method="dialog" className="modal-box">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>
        <h3 className="font-bold text-lg">Validator Details</h3>
        <div className="py-4">
          <p>
            <strong>Moniker:</strong> {validator.moniker}
          </p>
          <p>
            <strong>Power:</strong> {validator.power}
          </p>
          <p>
            <strong>Address:</strong> {validator.address}
          </p>
        </div>
        <div className="modal-action">
          <button className="btn">Close</button>
        </div>
      </form>
    </dialog>
  );
}
