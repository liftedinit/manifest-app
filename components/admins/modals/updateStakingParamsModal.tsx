import React from "react";

interface UpdateStakingParamsModalProps {
  modalId: string;
}

export function UpdateStakingParamsModal({
  modalId,
}: UpdateStakingParamsModalProps) {
  return (
    <dialog id={modalId} className="modal">
      <form method="dialog" className="modal-box">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>
        <h3 className="font-bold text-lg">Update Staking Parameters</h3>
        <div className="divider divider-horizon -mt-0 -mb-0"></div>
        <div className="py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-6 justify-center items-center w-full">
            <div className="flex flex-row gap-8 w-full justify-center items-center">
              <div className="flex flex-col gap-2 w-1/2  rounded-md">
                <span className="text-sm text-gray-400">UNBONDING TIME</span>
                <input
                  className="input input-bordered input-sm "
                  type={"number"}
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2 rounded-md">
                <span className="text-sm text-gray-400">MAX VALIDATORS</span>
                <input
                  className="input input-bordered input-sm "
                  type={"number"}
                />
              </div>
            </div>
            <div className="flex flex-row gap-8 w-full justify-center items-center">
              <div className="flex flex-col gap-2 w-1/2  rounded-md">
                <span className="text-sm text-gray-400">BOND DENOM</span>
                <input
                  className="input input-bordered input-sm "
                  type={"number"}
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2 rounded-md">
                <span className="text-sm text-gray-400">
                  MINIMUM COMMISSION
                </span>
                <input
                  className="input input-bordered input-sm "
                  type={"number"}
                />
              </div>
            </div>
            <div className="flex flex-row gap-8 w-full justify-center items-center">
              <div className="flex flex-col gap-2 w-1/2  rounded-md">
                <span className="text-sm text-gray-400">MAX ENTRIES</span>
                <input
                  className="input input-bordered input-sm "
                  type={"number"}
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2 rounded-md">
                <span className="text-sm text-gray-400">
                  HISTORICAL ENTRIES
                </span>
                <input
                  className="input input-bordered input-sm "
                  type={"number"}
                />
              </div>
            </div>
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
