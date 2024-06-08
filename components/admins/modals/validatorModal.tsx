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
        <div className="divider divider-horizon -mt-0"></div>
        <div className="flex flex-col justify-start items-start gap-2 px-4  mb-2 ">
          <span className="text-sm  capitalize text-gray-400 truncate">
            VALIDATOR
          </span>
          <div className="flex flex-row justify-start items-center  gap-4 ">
            <img
              className="h-14 w-14 rounded-full"
              src={`https://avatars.dicebear.com/api/initials/${validator.moniker}.svg`}
              alt=""
            />
            <span className="text-2xl">{validator.moniker}</span>
          </div>
        </div>

        <div className="p-4 grid  rounded-md w-full grid-cols-2  justify-start items-start gap-6">
          <div className="flex flex-col px-4 py-2 bg-base-300 rounded-md gap-2">
            <span className="text-sm text-gray-400">SECURITY CONTACT</span>
            <span className="text-md    rounded-md">{validator.moniker}</span>
          </div>
          <div className="flex flex-col  px-4 py-2 gap-2 bg-base-300  rounded-md">
            <span className="text-sm text-gray-400">POWER</span>
            <div className="flex flex-row gap-2 justify-between  rounded-md items-center">
              <input
                placeholder={validator.power}
                className="input input-bordered input-xs w-2/3"
                type={"number"}
              ></input>
              <button className="btn btn-xs btn-primary w-1/3">update</button>
            </div>
          </div>
          <div className="flex flex-col px-4 py-2 gap-2 bg-base-300  rounded-md">
            <span className="text-sm text-gray-400">OPERATOR ADDRESS</span>
            <span className="text-md  rounded-md">
              {validator.address.slice(-4)}
            </span>
          </div>
          <div className="flex flex-col  px-4 py-2 gap-2 bg-base-300  rounded-md">
            <span className="text-sm text-gray-400">DETAILS</span>
            <span className="text-md rounded-md">
              {validator.address.slice(-4)}
            </span>
          </div>
        </div>
      </form>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
