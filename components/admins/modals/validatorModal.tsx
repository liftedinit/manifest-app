import React from "react";

import { TruncatedAddressWithCopy } from "@/components/react/addressCopy";
import { ExtendedValidatorSDKType } from "../components";
import ProfileAvatar from "@/utils/identicon";
import { BsThreeDots } from "react-icons/bs";
import { DescriptionModal } from "./descriptionModal";
export function ValidatorDetailsModal({
  validator,
  modalId,
}: {
  validator: ExtendedValidatorSDKType | null;
  modalId: string;
}) {
  if (!validator) return null;

  const isEmail = (contact: string | undefined): boolean => {
    if (!contact) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(contact);
  };

  const handleDescription = () => {
    const modal = document.getElementById(
      `description-modal`
    ) as HTMLDialogElement;
    modal?.showModal();
  };

  return (
    <dialog id={modalId} className="modal">
      <form method="dialog" className="modal-box">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>
        <h3 className="font-bold text-lg">Validator Details</h3>
        <div className="divider divider-horizon -mt-0"></div>
        <div className="flex flex-col justify-start items-start gap-2 px-4 mb-2">
          <span className="text-sm capitalize text-gray-400 truncate">
            VALIDATOR
          </span>
          <div className="flex flex-row justify-start items-center gap-4">
            {validator.logo_url !== "" && (
              <img
                className="h-10 w-10 rounded-full"
                src={validator.logo_url}
                alt=""
              />
            )}
            {validator.logo_url === "" && (
              <ProfileAvatar
                walletAddress={validator.operator_address}
                size={64}
              />
            )}
            <span className="text-2xl">{validator.description.moniker}</span>
          </div>
        </div>

        <div className="p-4 grid rounded-md w-full grid-cols-2 justify-start items-start gap-6">
          <div className="flex flex-col px-4 py-2 bg-base-300 rounded-md gap-2">
            <span className="text-sm text-gray-400">SECURITY CONTACT</span>
            <span className="text-md rounded-md">
              {isEmail(validator.description.security_contact)
                ? validator.description.security_contact
                : "No Security Contact"}
            </span>
          </div>
          <div className="flex flex-col px-4 py-2 gap-2 bg-base-300 rounded-md">
            <span className="text-sm text-gray-400">POWER</span>
            <div className="flex flex-row gap-2 justify-between rounded-md items-center">
              <input
                placeholder={validator.consensus_power?.toString()}
                className="input input-bordered input-xs w-2/3"
                type="number"
              />
              <button className="btn btn-xs btn-primary w-1/3">update</button>
            </div>
          </div>
          <div className="flex flex-col px-4 py-2 gap-2 bg-base-300 rounded-md">
            <span className="text-sm text-gray-400">OPERATOR ADDRESS</span>
            <span className="text-md rounded-md">
              {TruncatedAddressWithCopy({
                address: validator.operator_address,
                slice: 8,
              })}
            </span>
          </div>
          <div className="flex flex-col px-4 py-2 gap-2 bg-base-300 rounded-md">
            <div className="flex flex-row justify-between items-center relative">
              <span className="text-sm text-gray-400">DETAILS</span>
              {validator.description.details.length > 20 && (
                <button
                  className="btn btn-sm btn-ghost hover:bg-transparent absolute -right-2 -top-2"
                  onClick={handleDescription}
                >
                  <BsThreeDots />
                </button>
              )}
            </div>

            <span className="text-md rounded-md">
              {validator.description.details
                ? validator.description.details.substring(0, 20) +
                  (validator.description.details.length > 20 ? "..." : "")
                : "No Details"}
            </span>
          </div>
        </div>
      </form>
      <DescriptionModal
        modalId="description-modal"
        details={validator.description.details ?? "No Details"}
      />
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
