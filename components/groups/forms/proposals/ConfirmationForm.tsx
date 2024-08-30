import React, { useState } from "react";
import { useFeeEstimation } from "@/hooks/useFeeEstimation";
import { uploadJsonToIPFS } from "@/hooks/useIpfs";
import { useTx } from "@/hooks/useTx";
import { manifest, strangelove_ventures, cosmos } from "@chalabi/manifestjs";
import { Any } from "@chalabi/manifestjs/dist/codegen/google/protobuf/any";
import { Cosmos_basev1beta1Msg_InterfaceDecoder } from "@chalabi/manifestjs/dist/codegen/cosmos/authz/v1beta1/tx";
import { TruncatedAddressWithCopy } from "@/components/react/addressCopy";
import {
  ProposalFormData,
  ProposalAction,
  Message,
} from "@/helpers/formReducer";
import { chainName } from "@/config";
import {
  MsgMultiSend,
  MsgSend,
} from "@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/tx";
import {
  MsgRemovePending,
  MsgRemoveValidator,
  MsgSetPower,
  MsgUpdateStakingParams,
  MsgUpdateParams as MsgUpdatePoaParams,
} from "@chalabi/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx";
import {
  MsgCreateGroupWithPolicy,
  MsgExec,
  MsgLeaveGroup,
  MsgSubmitProposal,
  MsgUpdateGroupAdmin,
  MsgUpdateGroupMembers,
  MsgUpdateGroupMetadata,
  MsgUpdateGroupPolicyAdmin,
  MsgVote,
  MsgWithdrawProposal,
} from "@chalabi/manifestjs/dist/codegen/cosmos/group/v1/tx";
import {
  MsgPayout,
  MsgUpdateParams as MsgUpdateManifestParams,
} from "@chalabi/manifestjs/dist/codegen/manifest/v1/tx";
import {
  MsgSoftwareUpgrade,
  MsgCancelUpgrade,
} from "@chalabi/manifestjs/dist/codegen/cosmos/upgrade/v1beta1/tx";
import { Duration } from "@chalabi/manifestjs/dist/codegen/google/protobuf/duration";
import { ThresholdDecisionPolicy } from "@chalabi/manifestjs/dist/codegen/cosmos/group/v1/types";
import { Buffer } from 'buffer';


export default function ConfirmationModal({
  policyAddress,
  nextStep,
  prevStep,
  formData,
  address,
}: Readonly<{
  policyAddress: string;
  nextStep: () => void;
  prevStep: () => void;
  formData: ProposalFormData;
  address: string;
}>) {
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;

  type MessageTypeMap = {
    send: MsgSend;
    updatePoaParams: MsgUpdatePoaParams;
    removeValidator: MsgRemoveValidator;
    removePending: MsgRemovePending;
    updateStakingParams: MsgUpdateStakingParams;
    setPower: MsgSetPower;
    updateManifestParams: MsgUpdateManifestParams;
    payoutStakeholders: MsgPayout;
    updateGroupAdmin: MsgUpdateGroupAdmin;
    updateGroupMembers: MsgUpdateGroupMembers;
    updateGroupMetadata: MsgUpdateGroupMetadata;
    updateGroupPolicyAdmin: MsgUpdateGroupPolicyAdmin;
    createGroupWithPolicy: MsgCreateGroupWithPolicy;
    submitProposal: MsgSubmitProposal;
    vote: MsgVote;
    withdrawProposal: MsgWithdrawProposal;
    exec: MsgExec;
    leaveGroup: MsgLeaveGroup;
    multiSend: MsgMultiSend;
    softwareUpgrade: MsgSoftwareUpgrade;
    cancelUpgrade: MsgCancelUpgrade;
    customMessage: any;
  };

  const messageTypeToComposer: {
    [K in keyof MessageTypeMap]: (value: MessageTypeMap[K]) => any;
  } = {
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
    customMessage: cosmos.bank.v1beta1.MessageComposer.withTypeUrl.send,
    exec: cosmos.group.v1.MessageComposer.withTypeUrl.exec,
    leaveGroup: cosmos.group.v1.MessageComposer.withTypeUrl.leaveGroup,
    multiSend: cosmos.bank.v1beta1.MessageComposer.withTypeUrl.multiSend,
    softwareUpgrade:
      cosmos.upgrade.v1beta1.MessageComposer.withTypeUrl.softwareUpgrade,
    cancelUpgrade:
      cosmos.upgrade.v1beta1.MessageComposer.withTypeUrl.cancelUpgrade,
  };
  const snakeToCamel = (str: string): string =>
    str.replace(/([-_][a-z])/gi, ($1) =>
      $1.toUpperCase().replace("-", "").replace("_", ""),
    );

  const convertKeysToCamelCase = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map((v) => convertKeysToCamelCase(v));
    } else if (obj !== null && typeof obj === "object") {
      return Object.keys(obj).reduce(
        (acc, key) => {
          acc[snakeToCamel(key)] = convertKeysToCamelCase(obj[key]);
          return acc;
        },
        {} as Record<string, any>,
      );
    }
    return obj;
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

  const { tx, isSigning, setIsSigning } = useTx(chainName);

  const { estimateFee } = useFeeEstimation("manifest");

  const uploadMetaDataToIPFS = async () => {
    const CID = await uploadJsonToIPFS(jsonString);
    return CID;
  };

  const handleConfirm = async () => {
    setIsSigning(true);
    const CID = await uploadMetaDataToIPFS();
  
    const messages = formData.messages.map((message) => {
      const composer = messageTypeToComposer[message.type as keyof MessageTypeMap];
      if (!composer) {
        throw new Error(`Unknown message type: ${message.type}`);
      }
      

      let { type, ...messageData } = message;
      messageData = convertKeysToCamelCase(messageData);
      
      const composedMessage = composer(messageData);
      
      return Any.fromPartial({
        typeUrl: composedMessage.typeUrl,
        value: composedMessage.value,
      });
    });

    const testMessage = {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.toProtoMsg({fromAddress: "manifest1afk9zr2hn2jsac63h4hm60vl9z3e5u69gndzf7c99cqge3vzwjzsfmy9qj", toAddress: "manifest1uwqjtgjhjctjc45ugy7ev5prprhehc7wclherd", amount: [{amount: "1", denom: "umfx"}]}),
    }
  
    const proposalMsg = {
      groupPolicyAddress: policyAddress,
      proposers: [formData.proposers],
      metadata: CID,
      messages: [testMessage],
      exec: 1, 
      title: formData.title,
      summary: formData.metadata.summary,
    };
  
   
  
    const msg = cosmos.group.v1.MessageComposer.withTypeUrl.submitProposal({
      groupPolicyAddress: policyAddress,
      proposers: [formData.proposers],
      metadata: CID,
      messages: [{
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: MsgSend.encode(MsgSend.fromPartial({fromAddress: "manifest1afk9zr2hn2jsac63h4hm60vl9z3e5u69gndzf7c99cqge3vzwjzsfmy9qj", toAddress: "manifest1uwqjtgjhjctjc45ugy7ev5prprhehc7wclherd", amount: [{amount: "1", denom: "umfx"}]})).finish(),
      }],
      exec: 1, 
      title: formData.title,
      summary: formData.metadata.summary,
    });
  
    
    try {
      const fee = {
        amount: [{amount: "1000", denom: "umfx"}],
        gas: "1000000",
      };
      await tx([msg], {
        fee,
        onSuccess: () => {
          nextStep();
        },
      });
    } catch (error) {
      console.error("Transaction error:", error);
     
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <section className="">
      <div className="lg:flex  mx-auto">
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
                  <label
                    className="block  text-lg font-light"
                    aria-label={"proposal-details"}
                  >
                    DETAILS
                  </label>
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
                  <div
                    className="max-h-24 mt-2 overflow-y-auto rounded-md bg-base-100 p-4"
                    aria-label={"meta-details"}
                  >
                    <a className="text-sm text-pretty">
                      {formData.metadata.details}
                    </a>
                  </div>
                </div>
              </div>
            </form>
            <div className="flex flex-row  justify-between w-full max-w-[41rem] gap-4 mt-6">
              <button
                onClick={prevStep}
                className="w-1/2 py-2.5 sm:py-3.5 btn btn-neutral"
              >
                Prev: Metadata
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSigning || !address}
                className="w-1/2  py-2.5 sm:py-3.5 btn btn-primary"
              >
                {isSigning ? (
                  <span className="loading loading-dots loading-sm"></span>
                ) : (
                  "Sign Transaction"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
