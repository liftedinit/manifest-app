import { useFeeEstimation } from "@/hooks/useFeeEstimation";
import { uploadJsonToIPFS } from "@/hooks/useIpfs";
import { useTx } from "@/hooks/useTx";
import { cosmos } from "@chalabi/manifestjs";
import { MsgSend } from "@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/tx";

import { Any } from "@chalabi/manifestjs/dist/codegen/google/protobuf/any";
import { Coin } from "@cosmjs/stargate";
import { useChain } from "@cosmos-kit/react";
import Link from "next/link";

import { useState } from "react";
export default function ConfirmationModal({
  policyAddress,
  nextStep,
  prevStep,
  formData,
  onDataChange,
}: {
  policyAddress: string;
  nextStep: () => void;
  prevStep: () => void;
  formData: {
    title: string;
    proposers: string;
    summary: string;
    messages: {
      from_address: string;
      to_address: string;
      amount: Coin[];
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
      amount: Coin[];
    }[];
    metadata: {
      title: string;
      authors: string;
      summary: string;
      details: string;
    };
  }) => void;
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
    return setCID(CID);
  };
  console.log(formData);

  const messages = formData.messages.map((message) => {
    return MsgSend.encode({
      fromAddress: message.from_address,
      toAddress: message.to_address,
      amount: [{ denom: "mfx", amount: "1" }],
    }).finish();
  });

  const packedMsg = Any.encode({
    typeUrl: cosmos.bank.v1beta1.MsgSend.typeUrl,
    value: MsgSend.encode({
      fromAddress: formData.messages[0].from_address,
      toAddress: formData.messages[0].to_address,
      amount: [{ denom: "umfx", amount: "1" }],
    }).finish(),
  }).finish();

  const msgSend = {
    typeUrl: cosmos.bank.v1beta1.MsgSend.typeUrl,
    value: packedMsg,
  };

  const handleConfirm = async () => {
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
                  Messages
                </div>
              </li>
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
                  Metadata
                </div>
              </li>
              <li className="flex-1">
                <div className="text-center mb-2">4</div>
                <div>Confirmation</div>
              </li>
            </ol>
            <h1 className="mb-4 text-2xl font-extrabold tracking-tight  sm:mb-6 leding-tight ">
              Confirmation
            </h1>
            <form className="min-h-[330px] max-h-[330px]">
              <div className="grid gap-5 my-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="full-name"
                    className="block mb-2 text-sm font-medium "
                  >
                    Group Title
                  </label>
                  <a className="font-medium mb-4 ">Manifest PoA Admins</a>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium "
                  >
                    Authors
                  </label>
                  <a className="font-medium mb-4 ">Lifted Intiative</a>
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium  "
                  >
                    Summary
                  </label>
                  <a className="font-medium mb-4 ">
                    The authority of the Manifest Network, and the Lifted
                    Initiative
                  </a>
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block mb-2 text-sm font-medium "
                  >
                    Description
                  </label>
                  <a className="font-medium mb-4 ">
                    This group is in authoratative contorl of the manifest
                    network
                  </a>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium "
                  >
                    Forum Link
                  </label>
                  <a className="font-medium mb-4 ">https://forum.cosmos</a>
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block mb-2 text-sm font-medium "
                  >
                    Threshold
                  </label>
                  <a className="font-medium mb-4 ">1 / 3</a>
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block mb-2 text-sm font-medium "
                  >
                    Voting Period
                  </label>
                  <a className="font-medium mb-4 ">3 days</a>
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block mb-2 text-sm font-medium "
                  >
                    Members
                  </label>
                  <div className="flex gap-2">
                    <a className="font-medium mb-4 ">manifest1...123243</a>
                    <a className="font-medium mb-4 ">manifest1...123243</a>
                  </div>
                </div>
              </div>
            </form>
            <div className="flex gap-4 mt-4">
              <button
                onClick={uploadMetaDataToIPFS}
                className="w-1/2 px-5 py-2.5 sm:py-3.5 btn btn-primary"
              >
                Upload Metadata
              </button>
              <button
                onClick={handleConfirm}
                className="w-1/2 px-5 py-2.5 sm:py-3.5 btn btn-primary"
              >
                Sign Transaction
              </button>
            </div>
            <div className="flex space-x-3 ga-4 mt-6">
              <button
                onClick={prevStep}
                className="text-center items-center w-1/2 py-2.5 sm:py-3.5 btn btn-neutral"
              >
                Prev: Member Info
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
