import React, { useState } from "react";
import {
  ProposalFormData,
  ProposalAction,
  Message,
  MessageFields,
} from "@/helpers/formReducer";

import * as initialMessages from "./messages";

export default function ProposalMessages({
  formData,
  dispatch,
  nextStep,
  prevStep,
}: {
  nextStep: () => void;
  prevStep: () => void;
  formData: ProposalFormData;
  dispatch: React.Dispatch<ProposalAction>;
}) {
  const [visibleMessages, setVisibleMessages] = useState<boolean[]>(
    formData.messages.map(() => true)
  );

  const handleAddMessage = () => {
    dispatch({
      type: "ADD_MESSAGE",
      message: initialMessages.initialSendMessage,
    });
    setVisibleMessages([...visibleMessages, true]);
  };

  const handleRemoveMessage = (index: number) => {
    dispatch({ type: "REMOVE_MESSAGE", index });
    setVisibleMessages(visibleMessages.filter((_, i) => i !== index));
  };

  const toggleVisibility = (index: number) => {
    setVisibleMessages(
      visibleMessages.map((visible, i) => (i === index ? !visible : visible))
    );
  };

  const handleChangeMessage = (
    index: number,
    field: MessageFields,
    value: any
  ) => {
    let updatedMessage = { ...formData.messages[index] };

    if (field === "type") {
      switch (value) {
        case "send":
          updatedMessage = {
            ...initialMessages.initialSendMessage,
            type: value,
          };
          break;
        case "customMessage":
          updatedMessage = {
            ...initialMessages.initialCustomMessage,
            type: value,
          };
          break;
        case "removeValidator":
          updatedMessage = {
            ...initialMessages.initialRemoveValidatorMessage,
            type: value,
          };
          break;
        case "removePending":
          updatedMessage = {
            ...initialMessages.initialRemovePendingMessage,
            type: value,
          };
          break;
        case "updatePoaParams":
          updatedMessage = {
            ...initialMessages.initialUpdatePoaParamsMessage,
            type: value,
          };
          break;
        case "updateStakingParams":
          updatedMessage = {
            ...initialMessages.initialUpdateStakingParamsMessage,
            type: value,
          };
          break;
        case "setPower":
          updatedMessage = {
            ...initialMessages.initialSetPowerMessage,
            type: value,
          };
          break;
        case "updateManifestParams":
          updatedMessage = {
            ...initialMessages.initialUpdateManifestParamsMessage,
            type: value,
          };
          break;
        case "payoutStakeholders":
          updatedMessage = {
            ...initialMessages.initialPayoutStakeholdersMessage,
            type: value,
          };
          break;
        case "updateGroupAdmin":
          updatedMessage = {
            ...initialMessages.initialUpdateGroupAdminMessage,
            type: value,
          };
          break;
        case "updateGroupMembers":
          updatedMessage = {
            ...initialMessages.initialUpdateGroupMembersMessage,
            type: value,
          };
          break;
        case "updateGroupMetadata":
          updatedMessage = {
            ...initialMessages.initialUpdateGroupMetadataMessage,
            type: value,
          };
          break;
        case "updateGroupPolicyAdmin":
          updatedMessage = {
            ...initialMessages.initialUpdateGroupPolicyAdminMessage,
            type: value,
          };
          break;
        case "createGroupWithPolicy":
          updatedMessage = {
            ...initialMessages.initialCreateGroupWithPolicyMessage,
            type: value,
          };
          break;
        case "submitProposal":
          updatedMessage = {
            ...initialMessages.initialSubmitProposalMessage,
            type: value,
          };
          break;
        case "vote":
          updatedMessage = {
            ...initialMessages.initialVoteMessage,
            type: value,
          };
          break;
        case "withdrawProposal":
          updatedMessage = {
            ...initialMessages.initialWithdrawProposalMessage,
            type: value,
          };
          break;
        case "exec":
          updatedMessage = {
            ...initialMessages.initialExecMessage,
            type: value,
          };
          break;
        case "leaveGroup":
          updatedMessage = {
            ...initialMessages.initialLeaveGroupMessage,
            type: value,
          };
          break;
        default:
          break;
      }
    } else {
      (updatedMessage as any)[field as string] = value;
    }

    dispatch({ type: "UPDATE_MESSAGE", index, message: updatedMessage });
  };

  const renderInputs = (
    object: any,
    handleChange: (field: string, value: any) => void,
    path = ""
  ) => {
    return Object.keys(object).map((key) => {
      const value = object[key];
      const currentPath = path ? `${path}.${key}` : key;

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        return (
          <div key={currentPath} className="grid grid-cols-1 gap-4">
            {renderInputs(value, handleChange, currentPath)}
          </div>
        );
      } else if (typeof value === "boolean") {
        return (
          <label key={currentPath} className="flex items-center">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={value}
              onChange={(e) => handleChange(currentPath, e.target.checked)}
            />
            <span className="ml-2 capitalize">{key.replace(/_/g, " ")}</span>
          </label>
        );
      } else {
        return (
          <input
            key={currentPath}
            type="text"
            placeholder={key.replace(/_/g, " ")}
            className="input input-bordered input-sm w-full"
            value={value}
            onChange={(e) => handleChange(currentPath, e.target.value)}
          />
        );
      }
    });
  };

  const renderMessageFields = (message: Message, index: number) => {
    interface Message {
      [key: string]: any;
    }

    const handleChange = (field: string, value: any) => {
      const fieldPath = field.split(".");
      let updatedMessage: any = { ...formData.messages[index] };

      let current = updatedMessage;
      for (let i = 0; i < fieldPath.length - 1; i++) {
        current = current[fieldPath[i]];
      }
      current[fieldPath[fieldPath.length - 1]] = value;

      dispatch({ type: "UPDATE_MESSAGE", index, message: updatedMessage });
    };

    return (
      <div className="grid grid-cols-1 gap-4">
        {renderInputs(message, (field, value) => handleChange(field, value))}
      </div>
    );
  };

  const handleNextStep = () => {
    nextStep();
  };

  return (
    <section className="">
      <div className="lg:flex min-h-screen mx-auto">
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
          <div className="w-full">
            <div className="w-full">
              <ol className="flex flex-wrap justify-between items-center text-md font-medium text-center mb-10">
                <li className="flex-1">
                  <div className="flex items-center sm:block after:content-['/'] sm:after:hidden after:mx-2 after:font-light">
                    <svg
                      className="w-4 h-4 mr-2 sm:mb-2 sm:w-6 sm:h-6 sm:mx-auto"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    Info
                  </div>
                </li>
                <li className="flex-1">
                  <div className="text-center mb-2">2</div>
                  <div>Messages</div>
                </li>
                <li className="flex-1">
                  <div className="text-center mb-2">3</div>
                  <div>Metadata</div>
                </li>
                <li className="flex-1">
                  <div className="text-center mb-2">4</div>
                  <div>Confirmation</div>
                </li>
              </ol>
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-extrabold tracking-tight sm:mb-6 leading-tight">
                  Messages
                </h1>
                <div className="flex gap-2 sm:mb-6">
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={handleAddMessage}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="min-h-[330px]">
                <div className="overflow-y-scroll max-h-[330px] min-h-[330px]">
                  <div className="space-y-6">
                    {formData.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`bg-base-300 shadow rounded-lg mx-auto p-4 max-w-[40rem] mb-4 transition-opacity ease-in-out `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex flex-row items-center gap-4">
                            <span className="text-lg font-bold">
                              #{index + 1}
                            </span>

                            <select
                              className="select select-bordered select-sm w-full h-sm py-1 text-center text-sm"
                              value={message.type}
                              onChange={(e) =>
                                handleChangeMessage(
                                  index,
                                  "type",
                                  e.target.value as keyof Message
                                )
                              }
                            >
                              <option value="send">Send</option>
                              <option value="custom_message">
                                Custom Message
                              </option>
                              <option value="updatePoaParams">
                                Update PoA Params
                              </option>
                              <option value="removeValidator">
                                Remove Validator
                              </option>
                              <option value="removePending">
                                Remove Pending
                              </option>
                              <option value="updateStakingParams">
                                Update Staking Params
                              </option>
                              <option value="setPower">Set Power</option>
                              <option value="updateManifestParams">
                                Update Manifest Params
                              </option>
                              <option value="payoutStakeholders">
                                Payout Stakeholders
                              </option>
                              <option value="updateGroupAdmin">
                                Update Group Admin
                              </option>
                              <option value="updateGroupMembers">
                                Update Group Members
                              </option>
                              <option value="updateGroupMetadata">
                                Update Group Metadata
                              </option>
                              <option value="updateGroupPolicyAdmin">
                                Update Group Policy Admin
                              </option>

                              <option value="vote">Vote</option>
                              <option value="withdrawProposal">
                                Withdraw Proposal
                              </option>

                              <option value="leaveGroup">Leave Group</option>
                            </select>
                          </div>
                          <div>
                            <button
                              type="button"
                              className="btn btn-error btn-xs"
                              onClick={() => handleRemoveMessage(index)}
                            >
                              -
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-primary ml-2"
                              onClick={() => toggleVisibility(index)}
                              disabled={!message.type}
                            >
                              {visibleMessages[index] ? "⋀" : "⋁"}
                            </button>
                          </div>
                        </div>
                        {visibleMessages[index] && (
                          <div className="mt-4">
                            {renderMessageFields(message, index)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  className="btn mt-4 btn-primary w-full"
                  disabled={formData.messages.length === 0}
                >
                  Next: Group Policy
                </button>
              </div>

              <div className="flex space-x-3 ga-4 mt-6">
                <button
                  onClick={prevStep}
                  className="text-center btn btn-neutral items-center w-1/2 py-2.5 sm:py-3.5 text-sm font-medium focus:outline-none  rounded-lg border"
                >
                  Prev: Proposal Details
                </button>
                <a className="text-center items-center w-1/2 py-2.5 sm:py-3.5 text-sm font-medium"></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
