import React, { useState } from "react";
import {
  ProposalFormData,
  ProposalAction,
  Message,
  MessageFields,
} from "@/helpers/formReducer";

import * as initialMessages from "./messages";
import { FiArrowUp, FiMinusCircle, FiPlusCircle } from "react-icons/fi";

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
    formData.messages.map(() => false)
  );

  const handleAddMessage = () => {
    dispatch({
      type: "ADD_MESSAGE",
      message: initialMessages.initialSendMessage,
    });
    setVisibleMessages([...visibleMessages, false]);
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
      if (key === "type") return null;

      const value = object[key];
      const currentPath = path ? `${path}.${key}` : key;

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        return (
          <div key={currentPath} className="grid grid-cols-2 gap-4">
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
          <div key={currentPath} className="">
            <div>
              <span className="ml-2 capitalize">{key.replace(/_/g, " ")}</span>
              <input
                key={currentPath}
                type="text"
                placeholder={key.replace(/_/g, " ")}
                className="input input-bordered input-sm w-full"
                value={value}
                onChange={(e) => handleChange(currentPath, e.target.value)}
              />
            </div>
          </div>
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
      <div className="grid grid-cols-2 gap-4 ">
        {renderInputs(message, (field, value) => handleChange(field, value))}
      </div>
    );
  };

  const handleNextStep = () => {
    nextStep();
  };

  return (
    <section className="">
      <div className="lg:flex mx-auto">
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
          <div className="w-full">
            <div className="w-full">
              <div className="flex flex-row  justify-between items-center">
                <h1 className="text-2xl font-extrabold tracking-tight sm:mb-6 leading-tight">
                  Messages
                </h1>
                <div className="flex gap-2 sm:mb-6">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={handleAddMessage}
                  >
                    <span>
                      <FiPlusCircle className="text-lg text-white" />
                    </span>
                  </button>
                </div>
              </div>

              <div className="min-h-[330px]">
                <div className="overflow-y-scroll max-h-[550px] min-h-[330px]">
                  <div className="space-y-6">
                    {formData.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`bg-base-300 shadow rounded-lg p-4 mb-4 animate-fadeIn `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex flex-row items-center gap-4">
                            <span className="text-lg font-bold">
                              #{index + 1}
                            </span>

                            <div className="dropdown">
                              <button
                                tabIndex={0}
                                className="btn m-1 btn-sm btn-neutral"
                              >
                                {message.type}
                              </button>
                              <ul
                                tabIndex={0}
                                className="dropdown-content z-[1] menu p-2 shadow bg-neutral rounded-box w-52 space-y-2"
                              >
                                <li>
                                  <button
                                    onClick={() =>
                                      handleChangeMessage(index, "type", "send")
                                    }
                                  >
                                    Send
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() =>
                                      handleChangeMessage(
                                        index,
                                        "type",
                                        "withdrawProposal"
                                      )
                                    }
                                  >
                                    Withdraw Proposal
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() =>
                                      handleChangeMessage(
                                        index,
                                        "type",
                                        "leaveGroup"
                                      )
                                    }
                                  >
                                    Leave Group
                                  </button>
                                </li>
                                {/* Add more options here */}
                              </ul>
                            </div>
                          </div>
                          <div>
                            <button
                              type="button"
                              className="btn btn-secondary btn-xs"
                              onClick={() => handleRemoveMessage(index)}
                            >
                              <span>
                                <FiMinusCircle className="text-xs text-white" />
                              </span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-primary ml-2 "
                              onClick={() => toggleVisibility(index)}
                              disabled={!message.type}
                            >
                              <span
                                className={`transition-all duration-400 ${
                                  visibleMessages[index]
                                    ? "rotate-0"
                                    : "rotate-180"
                                }`}
                              >
                                <FiArrowUp className="text-xs" />
                              </span>
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
                  Next: Proposal Metadata
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
