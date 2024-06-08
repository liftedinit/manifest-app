import React, { useState, useEffect } from "react";
import { ValidatorDetailsModal } from "../modals/validatorModal";
import { WarningModal } from "../modals/warningModal";

interface Validator {
  moniker: string;
  power: string;
  address: string;
}

export default function ValidatorList() {
  const [active, setActive] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(
    null
  );
  const [modalId, setModalId] = useState<string | null>(null);
  const [warningVisible, setWarningVisible] = useState(false);
  const [validatorToRemove, setValidatorToRemove] = useState<Validator | null>(
    null
  );

  const activeValidators: Validator[] = [
    {
      moniker: "Chandra Station",
      power: "1",
      address: "manifest1kjhsfajhskjasda",
    },
    { moniker: "KingNodes", power: "2", address: "manifest21jhe2jwhekjwdasd" },
    { moniker: "Zena", power: "3", address: "manifest3alkshkaj3r3iur43" },
    { moniker: "Stake4U", power: "4", address: "manifest4askldjaks83433353" },
    { moniker: "staek", power: "5", address: "manifest5asl;fjaklf88" },
  ];

  const pendingValidators: Validator[] = [
    { moniker: "Notional", power: "1", address: "manifest1akslhfklasf" },
    { moniker: "Polkachu", power: "2", address: "manifest234535" },
    { moniker: "Polkachu", power: "2", address: "manifest3aksfdasf" },
    { moniker: "Polkachu", power: "2", address: "manifest4;lasjf" },
  ];

  useEffect(() => {
    if (modalId) {
      const modal = document.getElementById(modalId) as HTMLDialogElement;
      modal?.showModal();
    }
  }, [modalId]);

  const handleRemove = (validator: Validator) => {
    setValidatorToRemove(validator);
    const modal = document.getElementById(`warning-modal`) as HTMLDialogElement;
    modal?.showModal();
  };

  const handleRowClick = (validator: Validator) => {
    setSelectedValidator(validator);
    setModalId(`validator-modal-${validator.address}`);
  };

  const confirmRemove = () => {
    if (validatorToRemove) {
      console.log(
        `Removing validator with address: ${validatorToRemove.address}`
      );
      setWarningVisible(false);
      setValidatorToRemove(null);
    }
  };

  const filteredValidators = active
    ? activeValidators.filter((validator) =>
        validator.moniker.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : pendingValidators.filter((validator) =>
        validator.moniker.toLowerCase().includes(searchTerm.toLowerCase())
      );

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
      <div className="overflow-x-auto shadow-md sm:rounded-lg bg-base-300 max-h-[16rem]">
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
            {filteredValidators.map((validator) => (
              <React.Fragment key={validator.address}>
                <tr
                  className="hover:bg-base-200/10 cursor-pointer"
                  onClick={() => handleRowClick(validator)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={`https://avatars.dicebear.com/api/initials/${validator.moniker}.svg`}
                          alt=""
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <span className="block truncate max-w-[20ch]">
                      {validator.moniker}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{validator.power}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(validator);
                      }}
                      className="btn btn-sm btn-secondary"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <ValidatorDetailsModal
        validator={selectedValidator}
        modalId={`validator-modal-${selectedValidator?.address}`}
      />
      <WarningModal
        isActive={active}
        address={validatorToRemove?.address || ""}
        moniker={validatorToRemove?.moniker || ""}
        modalId="warning-modal"
        onAccept={confirmRemove}
      />
    </div>
  );
}
