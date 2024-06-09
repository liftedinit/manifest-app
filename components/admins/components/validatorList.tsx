import React, { useState, useEffect } from "react";
import { ValidatorDetailsModal } from "../modals/validatorModal";
import { WarningModal } from "../modals/warningModal";
import { ValidatorSDKType } from "@chalabi/manifestjs/dist/codegen/cosmos/staking/v1beta1/staking";

import { CiUser } from "react-icons/ci";
import ProfileAvatar from "@/utils/identicon";
export interface ExtendedValidatorSDKType extends ValidatorSDKType {
  consensus_power?: bigint;
  logo_url?: string;
}
interface ValidatorListProps {
  activeValidators: ExtendedValidatorSDKType[];
  pendingValidators: ExtendedValidatorSDKType[];
}

export default function ValidatorList({
  activeValidators,
  pendingValidators,
}: ValidatorListProps) {
  const [active, setActive] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValidator, setSelectedValidator] =
    useState<ExtendedValidatorSDKType | null>(null);
  const [modalId, setModalId] = useState<string | null>(null);
  const [warningVisible, setWarningVisible] = useState(false);
  const [validatorToRemove, setValidatorToRemove] =
    useState<ExtendedValidatorSDKType | null>(null);

  useEffect(() => {
    if (modalId) {
      const modal = document.getElementById(modalId) as HTMLDialogElement;
      modal?.showModal();
    }
  }, [modalId]);

  const handleRemove = (validator: ExtendedValidatorSDKType) => {
    setValidatorToRemove(validator);
    setWarningVisible(true);
    const modal = document.getElementById(`warning-modal`) as HTMLDialogElement;
    modal?.showModal();
  };

  const handleRowClick = (validator: ExtendedValidatorSDKType) => {
    setSelectedValidator(validator);
    setModalId(`validator-modal-${validator.operator_address}`);
  };

  const filteredValidators = active
    ? (Array.isArray(activeValidators) ? activeValidators : []).filter(
        (validator) =>
          validator.description.moniker
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    : (Array.isArray(pendingValidators) ? pendingValidators : []).filter(
        (validator) =>
          validator.description.moniker
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
  console.log(activeValidators);

  return (
    <div className="w-full mx-auto p-4 bg-base-100 rounded-md">
      <div className="px-4 py-2 border-base-content flex items-center justify-between">
        <h3 className="text-lg font-bold leading-6">
          {active ? "Active Validators" : "Pending Validators"}
        </h3>
        <div className="flex flex-row items-center justify-between gap-2">
          <input
            type="text"
            placeholder="Search for a validator..."
            className="input input-bordered input-xs ml-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => setActive(!active)}
            className={`btn ${
              active ? "btn-secondary" : "btn-primary"
            } btn-xs min-w-[4rem]`}
          >
            {active ? "Pending" : "Active"}
          </button>
        </div>
      </div>
      <div className="divider divider-horizon -mt-2 mb-1"></div>
      <div className="overflow-x-auto shadow-md sm:rounded-lg bg-base-300 max-h-[16rem] min-h-[16rem]">
        <table className="table w-full table-fixed">
          <thead className="sticky top-0 z-10 bg-base-300">
            <tr>
              <th className="px-6 py-3 w-1/4">Logo</th>
              <th className="px-6 py-3 w-1/4">Moniker</th>
              <th className="px-6 py-3 w-1/4">Power</th>
              <th className="px-6 py-3 w-1/4">Remove</th>
            </tr>
          </thead>
          <tbody className="overflow-y-auto">
            {filteredValidators.length > 0 ? (
              filteredValidators.map((validator) => (
                <React.Fragment key={validator.operator_address}>
                  <tr
                    className="hover:bg-base-200/10 cursor-pointer"
                    onClick={() => handleRowClick(validator)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
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
                              size={38}
                            />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <span className="block truncate max-w-[20ch]">
                        {validator.description.moniker}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {validator.consensus_power?.toString()}
                    </td>
                    <td className="px-6 py-6 flex flex-row gap-4 justify-start items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(validator);
                        }}
                        className="btn btn-xs btn-secondary"
                      >
                        Remove
                      </button>
                      {active === false && (
                        <button className="btn btn-xs btn-primary">Add</button>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-24 border-b-0">
                  No {active ? "Active" : "Pending"} Validators
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ValidatorDetailsModal
        validator={selectedValidator}
        modalId={`validator-modal-${selectedValidator?.operator_address}`}
      />
      <WarningModal
        isActive={active}
        address={validatorToRemove?.operator_address || ""}
        moniker={validatorToRemove?.description.moniker || ""}
        modalId="warning-modal"
      />
    </div>
  );
}
