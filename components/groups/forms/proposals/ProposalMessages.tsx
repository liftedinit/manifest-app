import { Coin } from "@cosmjs/stargate";
import React, { useState } from "react";

const initialMessage = {
  type: "",
  from_address: "",
  to_address: "",
  amount: { denom: "", amount: "" },
  isVisible: false,
};

export default function ProposalMessages({
  formData,
  onDataChange,
  nextStep,
  prevStep,
}: {
  nextStep: () => void;
  prevStep: () => void;
  formData: {
    title: string;
    proposers: string;
    summary: string;
    messages: {
      from_address: string;
      to_address: string;
      amount: {
        denom: string;
        amount: string;
      };
      isVisible: boolean;
    }[];
    metadata: {
      title: string;
      authors: string;
      summary: string;
      details: string;
    };
  };
  onDataChange: (newData: {
    title: string;
    proposers: string;
    summary: string;
    messages: {
      from_address: string;
      to_address: string;
      amount: {
        denom: string;
        amount: string;
      };
      isVisible: boolean;
    }[];
    metadata: {
      title: string;
      authors: string;
      summary: string;
      details: string;
    };
  }) => void;
}) {
  const [txMessages, setMessages] = useState([initialMessage]);

  const handleAddMessage = () => {
    const newMessages = [...txMessages, { ...initialMessage }];

    setMessages([...txMessages, { ...initialMessage }]);
    onDataChange({ ...formData, messages: newMessages });
  };

  const handleRemoveMessage = (index: number) => {
    const newMessages = txMessages.filter((_, i) => i !== index);
    setMessages(newMessages);
    onDataChange({ ...formData, messages: newMessages });
  };

  const toggleVisibility = (index: number) => {
    const newMessages = txMessages.map((message, i) => {
      if (i === index) {
        return { ...message, isVisible: !message.isVisible };
      }
      return message;
    });
    setMessages(newMessages);
  };

  const handleChangeMessage = (index: number, field: string, value: any) => {
    const newMessages = txMessages.map((message, i) => {
      if (i === index) {
        if (field === "amount") {
          return {
            ...message,
            amount: { denom: value.denom, amount: value.amount },
          };
        } else {
          if (field === "type" && value !== "" && message.type === "") {
            return {
              ...message,
              [field]: value,
              isVisible: true,
            };
          } else {
            return {
              ...message,
              [field]: value,
            };
          }
        }
      }
      return message;
    });
    onDataChange({ ...formData, messages: newMessages });
    setMessages(newMessages);
  };

  const handleNextStep = () => {
    onDataChange({ ...formData, messages: txMessages });
    nextStep();
  };

  return (
    <section className="">
      <div className="lg:flex min-h-screen mx-auto">
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
          <div className="w-full">
            <div className="w-full">
              <ol className="flex flex-wrap justify-between items-center text-md font-medium text-center  mb-10">
                <li className="flex-1">
                  <div className="flex items-center sm:block after:content-['/'] sm:after:hidden after:mx-2 after:font-light ">
                    <svg
                      className="w-4 h-4 mr-2 sm:mb-2 sm:w-6 sm:h-6 sm:mx-auto"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
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
                <h1 className="text-2xl font-extrabold tracking-tight  sm:mb-6 leading-tight e">
                  Messages
                </h1>
                <div className="flex gap-2 sm:mb-6">
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => handleRemoveMessage(1)}
                  >
                    -
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={handleAddMessage}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className=" min-h-[330px]">
                <div className="overflow-y-scroll max-h-[330px] min-h-[330px]">
                  <div className="space-y-6">
                    {txMessages.map((message, index) => (
                      <div
                        key={index}
                        className="bg-base-200 shadow opacity-0 transition-opacity ease-in animate-fadeIn rounded-lg mx-auto p-4 max-w-[40rem] mb-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex flex-row items-center gap-4">
                            <span className="text-lg font-bold">
                              #{index + 1}
                            </span>

                            <select
                              className="select select-bordered select-sm w-full h-sm  py-1 text-center text-sm"
                              value={message.type}
                              onChange={(e) =>
                                handleChangeMessage(
                                  index,
                                  "type",
                                  e.target.value
                                )
                              }
                            >
                              <option disabled selected value="">
                                Select Type
                              </option>
                              <option value="send">Send</option>
                            </select>
                          </div>
                          <div>
                            <button
                              type="button"
                              className="btn btn-error btn-xs "
                              onClick={() => handleRemoveMessage(index)}
                            >
                              -
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-primary ml-2"
                              onClick={() => toggleVisibility(index)}
                              disabled={message.type === ""}
                            >
                              {message.isVisible ? "⋀" : "⋁"}
                            </button>
                          </div>
                        </div>
                        {message.isVisible && (
                          <div
                            className={`mt-4 transition-opacity ease-in-out ${
                              message.isVisible
                                ? "opacity-0 animate-fadeIn"
                                : "opacity-100 animate-fadeOut"
                            }`}
                          >
                            {message.type === "send" && (
                              <div className="grid grid-cols-1 gap-4">
                                <input
                                  type="text"
                                  placeholder="From Address (e.g. manifest1...)"
                                  className="input input-bordered input-sm w-full"
                                  value={message.from_address}
                                  onChange={(e) =>
                                    handleChangeMessage(
                                      index,
                                      "from_address",
                                      e.target.value
                                    )
                                  }
                                />
                                <input
                                  type="text"
                                  placeholder="To Address"
                                  className="input input-bordered input-sm w-full"
                                  value={message.to_address}
                                  onChange={(e) =>
                                    handleChangeMessage(
                                      index,
                                      "to_address",
                                      e.target.value
                                    )
                                  }
                                />
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Denom"
                                    className="input input-sm input-bordered w-1/2"
                                    value={message.amount.denom}
                                    onChange={(e) =>
                                      handleChangeMessage(index, "amount", {
                                        ...message.amount,
                                        denom: e.target.value,
                                      })
                                    }
                                  />
                                  <input
                                    type="text"
                                    placeholder="Amount"
                                    className="input input-sm input-bordered w-1/2"
                                    value={message.amount.amount}
                                    onChange={(e) =>
                                      handleChangeMessage(index, "amount", {
                                        ...message.amount,
                                        amount: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  className="btn mt-4 btn-primary w-full"
                  disabled={
                    !formData.messages.every(
                      (m) =>
                        m.from_address &&
                        m.to_address &&
                        m.amount.denom &&
                        m.amount.amount
                    ) || formData.messages.length === 0
                  }
                >
                  Next: Group Policy
                </button>
              </div>

              <div className="flex space-x-3 ga-4 mt-6">
                <button
                  onClick={prevStep}
                  className="text-center btn btn-neutral items-center w-1/2 py-2.5 sm:py-3.5 text-sm font-medium focus:outline-none  rounded-lg border "
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
