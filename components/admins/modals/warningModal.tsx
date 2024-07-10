import { chainName } from "@/config";
import { useFeeEstimation, useTx } from "@/hooks";
import { cosmos, strangelove_ventures } from "@chalabi/manifestjs";
import { useChain } from "@cosmos-kit/react";
import React from "react";
import { PiWarning } from "react-icons/pi";

interface WarningModalProps {
  admin: string;
  isActive: boolean;
  address: string;
  moniker: string;
  modalId: string;
}

export function WarningModal({
  admin,
  moniker,
  modalId,
  address,
  isActive,
}: WarningModalProps) {
  const { tx } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const { address: userAddress } = useChain(chainName);
  const { removePending, removeValidator } =
    strangelove_ventures.poa.v1.MessageComposer.withTypeUrl;
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;

  const handleAccept = async () => {
    const msgRemoveActive = removeValidator({
      sender: userAddress ?? "",
      validatorAddress: address,
    });

    const msgRemovePending = removePending({
      sender: userAddress ?? "",
      validatorAddress: address,
    });

    const groupProposalMsg = submitProposal({
      groupPolicyAddress: admin,
      messages: isActive ? [msgRemoveActive] : [msgRemovePending],
      metadata: "",
      proposers: [userAddress ?? ""],
      title: `Remove ${isActive ? "Active" : "Pending"} Validator ${moniker}`,
      summary: `Proposal to remove ${moniker} from the ${
        isActive ? "active" : "pending"
      } set.`,
      exec: 1,
    });

    const fee = await estimateFee(userAddress ?? "", [groupProposalMsg]);
    await tx([groupProposalMsg], {
      fee,
      onSuccess: () => {},
    });
  };

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
            from the {isActive ? "active set" : "pending list"}?
          </p>
        </div>

        <div className="modal-action">
          <button
            type="button"
            className="btn btn-secondary w-1/2 mx-auto -mt-2"
            onClick={handleAccept}
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
