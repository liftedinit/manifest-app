import React from "react";
import { PiWarning } from "react-icons/pi";

interface UpdateModalProps {
  modalId: string;
}

export function UpdateAdminModal({ modalId }: UpdateModalProps) {
  return (
    <dialog id={modalId} className="modal">
      <form method="dialog" className="modal-box">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>
        <h3 className="font-bold text-lg">Update Admin</h3>
        <div className="divider divider-horizon -mt-0 -mb-0"></div>
        <div className="py-4 flex flex-col gap-4">
          <div className="p-4 border-l-[6px] border-base-300">
            <div className="flex flex-row gap-2 items-center mb-2">
              <PiWarning className="text-yellow-200" />
              <span className="text-sm text-yellow-200">Warning</span>
            </div>
            <p className="text-md font-thin">
              Currently, the admin is set to a group policy address. While the
              admin can be any manifest1 address, it is recommended to set the
              new admin to another group policy address.
            </p>
          </div>
          <div className="flex flex-col gap-2 mt-3">
            <label className="text-md font-thin">Admin Address</label>
            <input
              type="text"
              placeholder="manifest123..."
              className="input input-bordered input-md w-full"
            />
          </div>
        </div>
        <div className="modal-action">
          <button type="button" className="btn w-full btn-primary">
            Update
          </button>
        </div>
      </form>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
