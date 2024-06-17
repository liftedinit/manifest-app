import React, { useState } from "react";
import { useFeeEstimation } from "@/hooks/useFeeEstimation";
import { uploadJsonToIPFS } from "@/hooks/useIpfs";
import { useTx } from "@/hooks/useTx";
import { manifest, strangelove_ventures, cosmos } from "@chalabi/manifestjs";

import { useChain } from "@cosmos-kit/react";
import { TruncatedAddressWithCopy } from "@/components/react/addressCopy";
import {
  ProposalFormData,
  ProposalAction,
  Message,
} from "@/helpers/formReducer";
import { chainName } from "@/config";

export default function ConfirmationModal({
  policyAddress,
  nextStep,
  prevStep,
  formData,
}: {
  policyAddress: string;
  nextStep: () => void;
  prevStep: () => void;
  formData: ProposalFormData;
}) {
  const { address } = useChain(chainName);
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;

  const messageTypeToComposer: { [key: string]: (value: any) => any } = {
    send: cosmos.bank.v1beta1.MessageComposer.withTypeUrl.send,
    updatePoaParams:
      strangelove_ventures.poa.v1.MessageComposer.withTypeUrl.updateParams,
    removeValidator:
      strangelove_ventures.poa.v1.MessageComposer.withTypeUrl.removeValidator,
    removePending:
      strangelove_ventures.poa.v1.MessageComposer.withTypeUrl.removePending,
    updateStakingParams:
      strangelove_ventures.poa.v1.MessageComposer.withTypeUrl
        .updateStakingParams,
    setPower: strangelove_ventures.poa.v1.MessageComposer.withTypeUrl.setPower,
    updateManifestParams: manifest.v1.MessageComposer.withTypeUrl.updateParams,
    payoutStakeholders: manifest.v1.MessageComposer.withTypeUrl.payout,
    updateGroupAdmin:
      cosmos.group.v1.MessageComposer.withTypeUrl.updateGroupAdmin,
    updateGroupMembers:
      cosmos.group.v1.MessageComposer.withTypeUrl.updateGroupMembers,
    updateGroupMetadata:
      cosmos.group.v1.MessageComposer.withTypeUrl.updateGroupMetadata,
    updateGroupPolicyAdmin:
      cosmos.group.v1.MessageComposer.withTypeUrl.updateGroupPolicyAdmin,
    createGroupWithPolicy:
      cosmos.group.v1.MessageComposer.withTypeUrl.createGroupWithPolicy,
    submitProposal: cosmos.group.v1.MessageComposer.withTypeUrl.submitProposal,
    vote: cosmos.group.v1.MessageComposer.withTypeUrl.vote,
    withdrawProposal:
      cosmos.group.v1.MessageComposer.withTypeUrl.withdrawProposal,
    exec: cosmos.group.v1.MessageComposer.withTypeUrl.exec,
    leaveGroup: cosmos.group.v1.MessageComposer.withTypeUrl.leaveGroup,
    multiSend: cosmos.bank.v1beta1.MessageComposer.withTypeUrl.multiSend,
    softwareUpgrade:
      cosmos.upgrade.v1beta1.MessageComposer.withTypeUrl.softwareUpgrade,
    cancelUpgrade:
      cosmos.upgrade.v1beta1.MessageComposer.withTypeUrl.cancelUpgrade,
  };

  const stripTypeField = (message: { [x: string]: any; type: any }) => {
    const { type, ...rest } = message;
    return rest;
  };

  const getMessageObject = (message: Message) => {
    const composer = messageTypeToComposer[message.type];
    if (composer) {
      const messageWithoutType = stripTypeField(message);
      return composer(messageWithoutType);
    }
    throw new Error(`Unknown message type: ${message.type}`);
  };

  const proposalMetadata = {
    title: formData.metadata.title,
    authors: formData.metadata.authors,
    summary: formData.metadata.summary,
    details: formData.metadata.details,
    proposalForumURL: "",
    voteOptionContext: "",
  };

  const jsonString = JSON.stringify(proposalMetadata);

  const { tx, Toast, toastMessage, setToastMessage } = useTx("manifest");
  const { estimateFee } = useFeeEstimation("manifest");

  const uploadMetaDataToIPFS = async () => {
    const CID = await uploadJsonToIPFS(jsonString);
    return CID;
  };

  const handleConfirm = async () => {
    const CID = await uploadMetaDataToIPFS();
    const messages: { typeUrl: string; value: any }[] = formData.messages.map(
      (message) => getMessageObject(message)
    );

    const msg = submitProposal({
      groupPolicyAddress: policyAddress ?? "",
      messages: messages,
      metadata: CID,
      proposers: [formData.proposers],
      title: formData.title,
      summary: formData.metadata.summary,
      exec: 1,
    });
    const fee = {
      amount: [
        {
          denom: "umfx",
          amount: "4000",
        },
      ],
      gas: "200000",
    };
    await tx([msg], {
      fee,
      onSuccess: () => {
        nextStep();
      },
    });
  };

  return (
    <section className="">
      <div className="lg:flex  mx-auto">
        <Toast toastMessage={toastMessage} setToastMessage={setToastMessage} />
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
          <div className="w-full">
            <h1 className="mb-4 text-2xl font-extrabold tracking-tight sm:mb-6 leading-tight">
              Confirmation
            </h1>
            <div className="divider divider-vertical md:hidden block" />
            <form className="min-h-[330px] sm:max-h-[590px] overflow-y-auto">
              {/* Proposal Details & Message Flex */}
              <div className="flex flex-row justify-between items-start gap-5">
                {/* Proposal Details */}
                <div className="flex w-1/2 flex-col gap-2 justify-between items-start">
                  <label className="block  text-lg font-light">DETAILS</label>
                  <div className="grid gap-5 mb-4 sm:grid-cols-1 bg-base-300 h-40 shadow w-full rounded-lg p-4">
                    <div>
                      <label
                        htmlFor="full-name"
                        className="block mb-2 text-sm font-medium text-gray-400"
                      >
                        TITLE
                      </label>
                      <a className="font-medium mb-4">{formData.title}</a>
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block mb-2 text-sm font-medium text-gray-400"
                      >
                        AUTHORS
                      </label>
                      <TruncatedAddressWithCopy
                        address={formData.proposers}
                        slice={14}
                      />
                    </div>
                  </div>
                </div>
                {/* Proposal Messages  */}
                <div className="flex flex-col gap-2 justify-between items-start  w-1/2">
                  <label className="block text-lg font-light">MESSAGES</label>
                  <div className="flex flex-col w-full bg-base-300 shadow h-40 overflow-y-auto rounded-lg p-4">
                    {formData.messages.map((message, index) => (
                      <div
                        key={index}
                        className="flex flex-col bg-base-100 p-2 mb-3 h-18 rounded-md relative"
                      >
                        <div className="absolute top-2 right-4">
                          # {index + 1}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div className="flex flex-col">
                            <a className="text-sm font-light text-gray-400">
                              TYPE
                            </a>
                            <a className="text-md">{message.type}</a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <label className="block mb-2 text-lg font-light mt-2">
                METADATA
              </label>
              <div className="flex flex-col bg-base-300 shadow rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <a className="text-sm font-light text-gray-400">AUTHORS</a>
                    <a className="text-xl mt-2">{formData.metadata.authors}</a>
                  </div>
                  <div className="flex flex-col">
                    <a className="text-sm font-light text-gray-400">TITLE</a>
                    <a className="text-xl mt-2">{formData.metadata.title}</a>
                  </div>
                </div>
                <div className="flex flex-col mt-4 w-full">
                  <a className="text-sm font-light text-gray-400">SUMMARY</a>
                  <div className="max-h-24 mt-2 overflow-y-auto rounded-md bg-base-100 p-4">
                    <a className="text-sm">{formData.metadata.summary}</a>
                  </div>
                </div>
                <div className="flex flex-col mt-4">
                  <a className="text-sm font-light text-gray-400">DETAILS</a>
                  <div className="max-h-24 mt-2 overflow-y-auto rounded-md bg-base-100 p-4">
                    <a className="text-sm text-pretty">
                      {formData.metadata.details}
                    </a>
                  </div>
                </div>
              </div>
            </form>
            <div className="flex space-x-3 ga-4 mt-6">
              <button
                onClick={prevStep}
                className="text-center items-center w-1/2 py-2.5 sm:py-3.5 btn btn-neutral"
              >
                Prev: Metadata
              </button>
              <button
                onClick={handleConfirm}
                className="w-1/2 px-5 py-2.5 sm:py-3.5 btn btn-primary"
              >
                Sign Transaction
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
