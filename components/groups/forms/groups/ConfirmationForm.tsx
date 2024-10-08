import { useEffect, useState } from "react";
import { TruncatedAddressWithCopy } from "@/components/react/addressCopy";
import { FormData } from "@/helpers/formReducer";
import { useFeeEstimation } from "@/hooks/useFeeEstimation";
import { uploadJsonToIPFS } from "@/hooks/useIpfs";
import { useTx } from "@/hooks/useTx";
import { cosmos } from "@chalabi/manifestjs";
import { ThresholdDecisionPolicy } from "@chalabi/manifestjs/dist/codegen/cosmos/group/v1/types";
import { Duration } from "@chalabi/manifestjs/dist/codegen/google/protobuf/duration";
import { useChain } from "@cosmos-kit/react";

export default function ConfirmationModal({
  nextStep,
  prevStep,
  formData,
}: Readonly<{
  nextStep: () => void;
  prevStep: () => void;
  formData: FormData;
}>) {
  const { address } = useChain("manifest");
  const { createGroupWithPolicy } = cosmos.group.v1.MessageComposer.withTypeUrl;
  const [isSigning, setIsSigning] = useState(false);
  const groupMetadata = {
    title: formData.title,
    authors: formData.authors,
    summary: formData.summary,
    details: formData.description,
    proposalForumURL: formData.forumLink,
    voteOptionContext: "",
  };

  // Convert the object to a JSON string
  const jsonString = JSON.stringify(groupMetadata);

  const { tx } = useTx("manifest");
  const { estimateFee } = useFeeEstimation("manifest");

  const uploadMetaDataToIPFS = async () => {
    const CID = await uploadJsonToIPFS(jsonString);
    return CID;
  };

  const minExecutionPeriod: Duration = {
    seconds: BigInt(0),
    nanos: 0,
  };

  const thresholdMsg = {
    threshold: formData.votingThreshold,
    windows: {
      votingPeriod: formData.votingPeriod,
      minExecutionPeriod: minExecutionPeriod,
    },
  };

  const threshholdPolicyFromPartial =
    ThresholdDecisionPolicy.fromPartial(thresholdMsg);

  const threshholdPolicy = ThresholdDecisionPolicy.encode(
    threshholdPolicyFromPartial,
  ).finish();

  const typeUrl = cosmos.group.v1.ThresholdDecisionPolicy.typeUrl;

  const handleConfirm = async () => {
    setIsSigning(true);
    try {
      const CID = await uploadMetaDataToIPFS();
      const msg = createGroupWithPolicy({
        admin: address ?? "",
        members: formData.members.map((member) => ({
          address: member.address,
          weight: member.weight,
          metadata: member.name,
          added_at: new Date(),
        })),
        groupMetadata: CID,
        groupPolicyMetadata: "",
        groupPolicyAsAdmin: true,
        decisionPolicy: {
          threshold: formData.votingThreshold,
          percentage: formData.votingThreshold,
          value: threshholdPolicy,
          typeUrl: typeUrl,
        },
      });
      const fee = await estimateFee(address ?? "", [msg]);
      await tx([msg], {
        fee,
        onSuccess: () => {
          nextStep();
        },
      });
    } catch (error) {
      setIsSigning(false);
      console.error("Error during transaction setup:", error);
    } finally {
      setIsSigning(false);
    }
  };

  const renderAuthors = () => {
    if (formData.authors.startsWith("manifest")) {
      return <TruncatedAddressWithCopy address={formData.authors} slice={14} />;
    } else if (formData.authors.includes(",")) {
      return formData.authors
        .split(",")
        .map((author, index) => (
          <div key={index}>
            {author.trim().startsWith("manifest") ? (
              <TruncatedAddressWithCopy address={author.trim()} slice={14} />
            ) : (
              <span>{author.trim()}</span>
            )}
          </div>
        ));
    } else {
      return <span>{formData.authors}</span>;
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
            <form className="min-h-[330px] sm:max-h-[590px] overflow-y-auto">
              {/* Group Details & Policy Flex */}

              {/* Group Details */}
              <div className="flex w-full flex-col gap-2 justify-between items-start">
                <label className="block  text-lg font-light">
                  GROUP DETAILS
                </label>
                <div className="grid gap-5 sm:grid-cols-2 bg-base-300 shadow w-full rounded-lg p-4">
                  <div className="flex flex-col gap-2">
                    <a className="text-sm font-light text-gray-400">
                      GROUP TITLE
                    </a>
                    <div className="max-h-24  overflow-y-auto rounded-md bg-base-100 p-4">
                      <a className="text-lg">{formData.title}</a>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <a className="text-sm font-light text-gray-400">AUTHORS</a>
                    <div className="max-h-24 h-full  overflow-y-auto rounded-md bg-base-100 p-4">
                      {renderAuthors()}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 h-full ">
                    <a className="text-sm font-light text-gray-400">SUMMARY</a>
                    <div className="max-h-24  overflow-y-auto rounded-md bg-base-100 p-4">
                      <a className="text-sm">{formData.summary}</a>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ">
                    <a className="text-sm font-light text-gray-400">
                      DESCRIPTION
                    </a>
                    <div className="max-h-24  overflow-y-auto rounded-md bg-base-100 p-4">
                      <a className="text-sm">{formData.description}</a>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ">
                    <a className="text-sm font-light text-gray-400">
                      THRESHOLD
                    </a>
                    <div className="max-h-24  overflow-y-auto rounded-md bg-base-100 p-4">
                      <a className="text-sm">{formData.votingThreshold}</a>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ">
                    <a className="text-sm font-light text-gray-400">
                      VOTING PERIOD
                    </a>
                    <div className="max-h-24  overflow-y-auto rounded-md bg-base-100 p-4">
                      <a className="text-sm">
                        {" "}
                        {formData.votingPeriod.seconds.toString()}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <label className="block mb-2 text-lg font-light mt-2">
                MEMBERS
              </label>
              <div className="flex flex-col bg-base-300 max-h-96 overflow-y-auto shadow rounded-lg p-4">
                {formData.members.map((member, index) => (
                  <div
                    key={index}
                    className="flex flex-col bg-base-100 p-4 mb-4 rounded-md relative"
                  >
                    <div className="absolute top-2 right-4"># {index + 1}</div>
                    <div className="grid sm:grid-cols-3 gap-6">
                      <div className="flex flex-col">
                        <a className="text-sm font-light text-gray-400">
                          ADDRESS
                        </a>
                        <TruncatedAddressWithCopy
                          address={member.address}
                          slice={14}
                        />
                      </div>
                      <div className="flex flex-col">
                        <a className="text-sm font-light text-gray-400">NAME</a>
                        <a className="text-md">{member.name}</a>
                      </div>
                      <div className="flex flex-col">
                        <a className="text-sm font-light text-gray-400">
                          WEIGHT
                        </a>
                        <a className="text-md">{member.weight}</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </form>
            <div className="flex space-x-3 ga-4 mt-6">
              <button
                onClick={prevStep}
                className="text-center items-center w-1/2 py-2.5 sm:py-3.5 btn btn-neutral"
              >
                Prev: Member Info
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSigning || !address}
                className="w-1/2 px-5 py-2.5 sm:py-3.5 btn btn-primary"
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
