import React, { useState } from "react";
import { useFeeEstimation } from "@/hooks/useFeeEstimation";
import { uploadJsonToIPFS } from "@/hooks/useIpfs";
import { useTx } from "@/hooks/useTx";
import { cosmos } from "@chalabi/manifestjs";
import { MsgSend } from "@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/tx";
import { Any } from "@chalabi/manifestjs/dist/codegen/google/protobuf/any";
import { Coin } from "@cosmjs/stargate";
import { useChain } from "@cosmos-kit/react";
import { TruncatedAddressWithCopy } from "@/components/react/addressCopy";
import { ProposalFormData, ProposalAction } from "@/helpers/formReducer";

export default function ConfirmationModal({
  policyAddress,
  nextStep,
  prevStep,
  formData,
  dispatch,
}: {
  policyAddress: string;
  nextStep: () => void;
  prevStep: () => void;
  formData: ProposalFormData;
  dispatch: React.Dispatch<ProposalAction>;
}) {
  const { address } = useChain("manifest");
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;

  const [CID, setCID] = useState<string>("");

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
    setCID(CID);
  };

  const messages = formData.messages.map((message) =>
    MsgSend.encode({
      from_address: message.from_address,
      to_address: message.to_address,
      amount: [message.amount],
    }).finish()
  );

  const packedMsg = Any.encode({
    type_url: cosmos.bank.v1beta1.MsgSend.typeUrl,
    value: MsgSend.encode({
      from_address: formData.messages[0].from_address,
      to_address: formData.messages[0].to_address,
      amount: [{ denom: "umfx", amount: "1" }],
    }).finish(),
  }).finish();

  const msgSend = {
    type_url: cosmos.bank.v1beta1.MsgSend.typeUrl,
    value: packedMsg,
  };

  const handleConfirm = async () => {
    await uploadMetaDataToIPFS();
    const msg = submitProposal({
      address: policyAddress ?? "",
      messages: [msgSend],
      metadata: CID,
      proposers: [formData.proposers],
      exec: 1,
    });
    const fee = {
      amount: [
        {
          denom: "mfx",
          amount: "0.01",
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
      <div className="lg:flex min-h-screen mx-auto">
        <Toast toastMessage={toastMessage} setToastMessage={setToastMessage} />
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
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
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  Info
                </div>
              </li>
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
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  Messages
                </div>
              </li>
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
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  Metadata
                </div>
              </li>
              <li className="flex-1">
                <div className="text-center mb-2">4</div>
                <div>Confirmation</div>
              </li>
            </ol>
            <h1 className="mb-4 text-2xl font-extrabold tracking-tight sm:mb-6 leading-tight">
              Confirmation
            </h1>
            <div className="divider divider-vertical md:hidden block" />
            <form className="min-h-[330px] sm:max-h-[394px] overflow-y-auto">
              <label className="block mb-2 text-xl font-light">DETAILS</label>
              <div className="grid gap-5 mb-4 sm:grid-cols-2 bg-base-200 shadow rounded-lg p-4">
                <div>
                  <label
                    htmlFor="full-name"
                    className="block mb-2 text-sm font-medium"
                  >
                    Group Title
                  </label>
                  <a className="font-medium mb-4">{formData.title}</a>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium"
                  >
                    Authors
                  </label>
                  <TruncatedAddressWithCopy
                    address={formData.proposers}
                    slice={14}
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium"
                  >
                    Summary
                  </label>
                  <a className="font-medium mb-4">{formData.summary}</a>
                </div>
              </div>
              <label className="block mb-2 text-xl font-light">MESSAGES</label>
              <div className="flex flex-col bg-base-200 shadow rounded-lg p-4">
                {formData.messages.map((message, index) => (
                  <div
                    key={index}
                    className="flex flex-col bg-base-300 p-4 mb-4 rounded-md relative"
                  >
                    <div className="absolute top-2 right-4"># {index + 1}</div>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="flex flex-col">
                        <a className="text-sm font-light">TYPE</a>
                        <a className="text-md">/cosmos.bank.v1beta1.MsgSend</a>
                      </div>
                      <div className="flex flex-col">
                        <a className="text-sm font-light">FROM</a>
                        <TruncatedAddressWithCopy
                          address={message.from_address}
                          slice={14}
                        />
                      </div>
                      <div className="flex flex-col">
                        <a className="text-sm font-light">TO</a>
                        <TruncatedAddressWithCopy
                          address={message.to_address}
                          slice={14}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <label className="block mb-2 text-xl font-light mt-6">
                METADATA
              </label>
              <div className="flex flex-col bg-base-200 shadow rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <a className="text-sm font-light">AUTHORS</a>
                    <a className="text-xl mt-2">{formData.metadata.authors}</a>
                  </div>
                  <div className="flex flex-col">
                    <a className="text-sm font-light">TITLE</a>
                    <a className="text-xl mt-2">{formData.metadata.title}</a>
                  </div>
                </div>
                <div className="flex flex-col mt-4">
                  <a className="text-sm font-light">DETAILS</a>
                  <div className="max-h-24 mt-2 overflow-y-auto rounded-md bg-base-300 p-4">
                    <a className="text-sm">{formData.metadata.details}</a>
                  </div>
                </div>
                <div className="flex flex-col mt-4">
                  <a className="text-sm font-light">SUMMARY</a>
                  <div className="max-h-24 mt-2 overflow-y-auto rounded-md bg-base-300 p-4">
                    <a className="text-sm">{formData.metadata.summary}</a>
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
