import React, { useEffect, useState } from "react";
import { ExtendedGroupType, useFeeEstimation, useTx } from "@/hooks";
import { ParamsSDKType } from "@chalabi/manifestjs/dist/codegen/strangelove_ventures/poa/v1/params";
import { UpdateAdminModal } from "../modals/updateAdminModal";

import { BsThreeDots } from "react-icons/bs";
import { DescriptionModal } from "../modals/descriptionModal";
import ProfileAvatar from "@/utils/identicon";

import { chainName } from "@/config";
import { strangelove_ventures, cosmos } from "@chalabi/manifestjs";
import { MsgUpdateParams } from "@chalabi/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx";
import { Any } from "@chalabi/manifestjs/dist/codegen/google/protobuf/any";

interface AdminOptionsProps {
  poaParams: ParamsSDKType;
  group: ExtendedGroupType;
  isLoading: boolean;
  address: string;
  admin: string;
}

export default function AdminOptions({
  poaParams,
  group,
  isLoading,
  address,
  admin,
}: AdminOptionsProps) {
  const exitEnabled = true;

  const handleOpen = () => {
    const modal = document.getElementById(
      `update-admin-modal`,
    ) as HTMLDialogElement;
    modal?.showModal();
  };

  const handleDescription = () => {
    const modal = document.getElementById(
      `description-modal`,
    ) as HTMLDialogElement;
    modal?.showModal();
  };

  const { estimateFee } = useFeeEstimation(chainName);
  const { tx } = useTx(chainName);
  const { updateParams } =
    strangelove_ventures.poa.v1.MessageComposer.withTypeUrl;
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;

  const handleUpdate = async () => {
    const msgUpdateAdmin = updateParams({
      sender: admin ?? "",
      params: {
        admins: poaParams.admins,
        allowValidatorSelfExit:
          poaParams.allow_validator_self_exit === true ? false : true,
      },
    });

    const anyMessage = Any.fromPartial({
      typeUrl: msgUpdateAdmin.typeUrl,
      value: MsgUpdateParams.encode(msgUpdateAdmin.value).finish(),
    });

    const groupProposalMsg = submitProposal({
      groupPolicyAddress: admin,
      messages: [anyMessage],
      metadata: "",
      proposers: [address ?? ""],
      title: `Update Self Exit`,
      summary: `This proposal will ${
        poaParams.allow_validator_self_exit === true ? "enable" : "disable"
      } the ability to leave the active set.`,
      exec: 0,
    });

    const fee = await estimateFee(address ?? "", [groupProposalMsg]);
    await tx([groupProposalMsg], {
      fee,
      onSuccess: () => {},
    });
  };
  return (
    <div className="lg:w-1/2 w-full mx-auto p-4 bg-base-100 rounded-md lg:max-h-[352px]">
      <div className="px-4 py-2 border-base-content flex items-center justify-between">
        <h3 className="text-lg font-bold leading-6">Admin</h3>
      </div>
      <div className="divider divider-horizon -mt-2 mb-1"></div>
      {isLoading && <div className="skeleton w-full h-auto"></div>}
      {!isLoading && (
        <div className=" relative flex flex-col gap-8 w-full h-auto justify-between items-center bg-base-300 rounded-md p-2">
          <div className="flex h-[5.2rem] w-[5.2rem] bg-base-300 justify-center items-center rounded-full">
            <ProfileAvatar
              walletAddress={group?.created_at.toString() ?? ""}
              size={64}
            />
          </div>
          <a className="lg:text-2xl text-xl leading-6 -mt-2" aria-label="title">
            {group?.ipfsMetadata?.title}
          </a>

          <a
            className="text-sm leading-tight flex-wrap text-center text-neutral-content max-h-10 max-w-96 overflow-y-auto -mt-6"
            aria-label="details"
          >
            {group?.ipfsMetadata?.details}
          </a>
          <button
            className="btn btn-sm btn-ghost absolute right-2 bottom-17"
            onClick={handleDescription}
            aria-label="three-dots"
          >
            <BsThreeDots />
          </button>

          <div className="flex flex-row gap-4 justify-center items-center -mt-2 w-full pb-3">
            <button
              className="btn block lg:hidden btn-primary btn-sm w-2/6"
              onClick={handleOpen}
            >
              Update
            </button>
            <button
              className="btn hidden lg:block btn-primary btn-sm w-2/6"
              onClick={handleOpen}
              aria-label="update admin"
            >
              Update Admin
            </button>
            <button
              onClick={handleUpdate}
              className={`btn block lg:hidden ${
                exitEnabled ? "btn-secondary" : "btn-primary"
              } btn-sm w-2/6`}
            >
              {poaParams.allow_validator_self_exit ? "Disable " : "Enable "}
            </button>
            <button
              onClick={handleUpdate}
              className={`btn hidden lg:block ${
                exitEnabled ? "btn-secondary" : "btn-primary"
              } btn-sm w-2/6`}
            >
              {poaParams.allow_validator_self_exit
                ? "Disable Self Exit"
                : "Enable Self Exit"}
            </button>
          </div>
        </div>
      )}

      <UpdateAdminModal
        userAddress={address ?? ""}
        modalId="update-admin-modal"
        admin={admin ?? ""}
        allowExit={poaParams.allow_validator_self_exit}
      />

      <DescriptionModal
        type="group"
        modalId="description-modal"
        details={group?.ipfsMetadata?.details ?? ""}
      />
    </div>
  );
}
