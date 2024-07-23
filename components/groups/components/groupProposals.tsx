import {
  ExtendedQueryGroupsByMemberResponseSDKType,
  useGroupsByMember,
  useProposalsByPolicyAccount,
  useTallyCount,
  useVotesByProposal,
} from "@/hooks/useQueries";

import ProfileAvatar from "@/utils/identicon";
import VoteDetailsModal from "@/components/groups/modals/voteDetailsModal";
import { QueryTallyResultResponseSDKType } from "@chalabi/manifestjs/dist/codegen/cosmos/group/v1/query";
import {
  MemberSDKType,
  ProposalExecutorResult,
  ProposalSDKType,
  ProposalStatus,
} from "@chalabi/manifestjs/dist/codegen/cosmos/group/v1/types";
import Link from "next/link";
import { truncateString } from "@/utils";
import { useEffect, useState } from "react";
import { PiArrowDownLight } from "react-icons/pi";
import { useRouter } from "next/router";
import { useChain } from "@cosmos-kit/react";
import { TruncatedAddressWithCopy } from "@/components/react/addressCopy";

export default function ProposalsForPolicy({
  policyAddress,
}: {
  policyAddress: string;
}) {
  const { address } = useChain("manifest");

  const [tallies, setTallies] = useState<
    { proposalId: bigint; tally: QueryTallyResultResponseSDKType }[]
  >([]);

  const updateTally = (
    proposalId: bigint,
    newTally: QueryTallyResultResponseSDKType
  ) => {
    setTallies((prevTallies) => {
      const existingTallyIndex = prevTallies.findIndex(
        (item) => item.proposalId === proposalId
      );

      if (existingTallyIndex >= 0) {
        const newTallies = [...prevTallies];
        newTallies[existingTallyIndex] = { proposalId, tally: newTally };
        return newTallies;
      } else {
        return [...prevTallies, { proposalId, tally: newTally }];
      }
    });
  };

  const [selectedProposal, setSelectedProposal] = useState(null);

  const handleRowClick = (proposal: any) => {
    setSelectedProposal(proposal);
    const modal = document.getElementById(
      `vote_modal_${proposal.id}`
    ) as HTMLDialogElement;
    modal?.showModal();
  };

  const {
    groupByMemberData,
    isGroupByMemberLoading,
    isGroupByMemberError,
    refetchGroupByMember,
  } = useGroupsByMember(address ?? "");

  const { proposals, isProposalsLoading, isProposalsError, refetchProposals } =
    useProposalsByPolicyAccount(policyAddress ?? "");

  console.log("proposals", proposals);

  const members =
    groupByMemberData?.groups.filter(
      (group) => group.policies[0]?.address === policyAddress
    )[0]?.members ?? [];
  const admin =
    groupByMemberData.groups.filter(
      (group) => group.policies[0]?.address === policyAddress
    )[0]?.admin ?? "";
  const groupName =
    groupByMemberData.groups.filter(
      (group) => group.policies[0]?.address === policyAddress
    )[0]?.ipfsMetadata?.title ?? "";

  function isProposalPassing(tally: QueryTallyResultResponseSDKType) {
    const yesCount = parseFloat(tally?.tally?.yes_count ?? "0");
    const noCount = parseFloat(tally?.tally?.no_count ?? "0");
    const noWithVetoCount = parseFloat(tally?.tally?.no_with_veto_count ?? "0");
    const abstainCount = parseFloat(tally?.tally?.abstain_count ?? "0");

    const passingThreshold = yesCount > noCount;

    return {
      isPassing: passingThreshold,
      yesCount,
      noCount,
      noWithVetoCount,
      abstainCount,
    };
  }

  type ChainMessageType =
    | "/cosmos.bank.v1beta1.MsgSend"
    | "/strangelove_ventures.poa.v1.MsgSetPower"
    | "/cosmos.group.v1.MsgCreateGroup"
    | "/cosmos.group.v1.MsgUpdateGroupMembers"
    | "/cosmos.group.v1.MsgUpdateGroupAdmin"
    | "/cosmos.group.v1.MsgUpdateGroupMetadata"
    | "/cosmos.group.v1.MsgCreateGroupPolicy"
    | "/cosmos.group.v1.MsgCreateGroupWithPolicy"
    | "/cosmos.group.v1.MsgSubmitProposal"
    | "/cosmos.group.v1.MsgVote"
    | "/cosmos.group.v1.MsgExec"
    | "/cosmos.group.v1.MsgLeaveGroup"
    | "/manifest.v1.MsgUpdateParams"
    | "/manifest.v1.MsgPayout"
    | "/cosmos.upgrade.v1beta1.MsgSoftwareUpgrade"
    | "/cosmos.upgrade.v1beta1.MsgCancelUpgrade";

  const typeRegistry: Record<ChainMessageType, string> = {
    "/cosmos.bank.v1beta1.MsgSend": "Send",
    "/strangelove_ventures.poa.v1.MsgSetPower": "Set Power",
    "/cosmos.group.v1.MsgCreateGroup": "Create Group",
    "/cosmos.group.v1.MsgUpdateGroupMembers": "Update Group Members",
    "/cosmos.group.v1.MsgUpdateGroupAdmin": "Update Group Admin",
    "/cosmos.group.v1.MsgUpdateGroupMetadata": "Update Group Metadata",
    "/cosmos.group.v1.MsgCreateGroupPolicy": "Create Group Policy",
    "/cosmos.group.v1.MsgCreateGroupWithPolicy": "Create Group With Policy",
    "/cosmos.group.v1.MsgSubmitProposal": "Submit Proposal",
    "/cosmos.group.v1.MsgVote": "Vote",
    "/cosmos.group.v1.MsgExec": "Execute Proposal",
    "/cosmos.group.v1.MsgLeaveGroup": "Leave Group",
    "/manifest.v1.MsgUpdateParams": "Update Manifest Params",
    "/manifest.v1.MsgPayout": "Payout",
    "/cosmos.upgrade.v1beta1.MsgSoftwareUpgrade": "Software Upgrade",
    "/cosmos.upgrade.v1beta1.MsgCancelUpgrade": "Cancel Upgrade",
  };

  function getHumanReadableType(type: string): string {
    const registeredType = typeRegistry[type as ChainMessageType];
    if (registeredType) {
      return registeredType;
    }
    const parts = type.split(".");
    const lastPart = parts[parts.length - 1];
    return lastPart
      .replace("Msg", "")
      .replace(/([A-Z])/g, " $1")
      .trim();
  }
  return (
    <section className="">
      <div className="flex flex-col  max-w-5xl mx-auto w-full  ">
        <div className="  rounded-md   w-full mt-4 justify-center  shadow  bg-base-200 items-center mx-auto transition-opacity duration-300 ease-in-out animate-fadeIn">
          <div className="rounded-md px-4 py-2 bg-base-100   max-h-[23rem]  min-h-[23rem]  ">
            <div className="px-4 py-2  flex flex-row justify-between items-center border-base-content">
              <h3 className="text-lg font-bold leading-6">Proposals</h3>

              <Link href={`/groups/submit-proposal/${policyAddress}`} passHref>
                <button
                  aria-disabled={!policyAddress}
                  className="btn btn-xs btn-primary"
                >
                  New Proposal
                </button>
              </Link>
            </div>
            <div className="divider divider-horizon -mt-2"></div>
            {isProposalsLoading ? (
              <div className="flex px-4 flex-col gap-4 w-full mx-auto justify-center mt-6 mb-[2.05rem]  items-center transition-opacity duration-300 ease-in-out animate-fadeIn">
                <div className="skeleton h-4 w-full "></div>
                <div className="skeleton h-4 w-full "></div>
                <div className="skeleton h-4 w-full "></div>
                <div className="skeleton h-4 w-full "></div>
                <div className="skeleton h-4 w-full "></div>
                <div className="skeleton h-4 w-full "></div>
                <div className="skeleton h-4 w-full "></div>
                <div className="skeleton h-12 w-full "></div>
              </div>
            ) : isProposalsError ? (
              <div className="py-2">Error loading proposals</div>
            ) : (
              <>
                <div className="">
                  {proposals?.length === 0 && (
                    <div className="flex flex-col my-36 gap-4 w-full mx-auto justify-center items-center transition-opacity duration-300 ease-in-out animate-fadeIn">
                      <div className="text-center underline">
                        No proposals found for this policy
                      </div>
                    </div>
                  )}
                  {proposals?.length > 0 && (
                    <div className="bg-base-300 -mt-2 flex p-4 rounded-md base-200 overflow-y-auto max-h-[15rem] min-h-[15rem] ">
                      <table className="table w-full  z-0 transition-opacity bg-base-300 duration-300 ease-in-out animate-fadeIn text-left ">
                        <thead className="bg-base-300 ">
                          <tr className="w-full">
                            <th className="w-1/6 bg-base-300">#</th>
                            <th className="w-1/6 bg-base-300">Title</th>
                            <th className="w-1/6 bg-base-300">Time Left</th>
                            <th className="w-1/6 bg-base-300">Type</th>
                            <th className="w-1/6 bg-base-300">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {proposals?.map((proposal, index) => {
                            // Find the corresponding tally for this proposal
                            const proposalTally = tallies.find(
                              (t) => t.proposalId === proposal.id
                            );
                            const { isPassing = false } = proposalTally
                              ? isProposalPassing(proposalTally.tally)
                              : {};
                            const endTime = new Date(
                              proposal?.voting_period_end
                            );
                            const now = new Date();
                            const msPerMinute = 1000 * 60;
                            const msPerHour = msPerMinute * 60;
                            const msPerDay = msPerHour * 24;

                            const diff = endTime.getTime() - now.getTime();

                            let timeLeft: string;

                            if (diff <= 0) {
                              timeLeft = "none";
                            } else if (diff >= msPerDay) {
                              const days = Math.floor(diff / msPerDay);
                              timeLeft = `${days} day${days === 1 ? "" : "s"}`;
                            } else if (diff >= msPerHour) {
                              const hours = Math.floor(diff / msPerHour);
                              timeLeft = `${hours} hour${
                                hours === 1 ? "" : "s"
                              }`;
                            } else if (diff >= msPerMinute) {
                              const minutes = Math.floor(diff / msPerMinute);
                              timeLeft = `${minutes} minute${
                                minutes === 1 ? "" : "s"
                              }`;
                            } else {
                              timeLeft = "less than a minute";
                            }
                            return (
                              <tr
                                onClick={() => handleRowClick(proposal)}
                                key={index}
                                style={{ maxHeight: "3rem" }}
                                className={`w-full
                            hover:bg-base-200 !important 
                            active:bg-base-100 
                            focus:bg-base-300 focus:shadow-inner 
                            transition-all duration-200 
                            cursor-pointer `}
                              >
                                <td className="">#{proposal.id.toString()}</td>
                                <td className="w-2/6 truncate">
                                  {proposal.title.toLowerCase()}
                                </td>
                                <td className="w-1/6">
                                  {diff <= 0 &&
                                  proposal.executor_result ===
                                    ("PROPOSAL_EXECUTOR_RESULT_NOT_RUN" as unknown as ProposalExecutorResult)
                                    ? "none"
                                    : timeLeft}
                                </td>
                                <td className="w-1/6 truncate ...">
                                  {getHumanReadableType(
                                    (proposal.messages[0] as any)["@type"]
                                  )}
                                </td>
                                <td className="w-1/6">
                                  {isPassing &&
                                  diff > 0 &&
                                  proposal.executor_result ===
                                    ("PROPOSAL_EXECUTOR_RESULT_NOT_RUN" as unknown as ProposalExecutorResult)
                                    ? "Passing"
                                    : isPassing &&
                                      diff <= 0 &&
                                      proposal.executor_result ===
                                        ("PROPOSAL_EXECUTOR_RESULT_NOT_RUN" as unknown as ProposalExecutorResult)
                                    ? "Passed"
                                    : (diff > 0 &&
                                        proposal.executor_result ===
                                          ("PROPOSAL_EXECUTOR_RESULT_FAILURE" as unknown as ProposalExecutorResult)) ||
                                      (diff > 0 &&
                                        proposal.status ===
                                          ("PROPOSAL_STATUS_REJECTED" as unknown as ProposalStatus))
                                    ? "Failing"
                                    : "Failed"}
                                </td>
                                <Modal
                                  admin={admin}
                                  proposalId={proposal.id}
                                  members={members}
                                  proposal={proposal}
                                  updateTally={updateTally}
                                />
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                {proposals.length > 0 && (
                  <div className=" flex-row justify-center items-center mx-auto w-full hidden md:flex gap-4 transition-opacity  duration-300 ease-in-out animate-fadeIn h-16   rounded-md -mt-1 ">
                    <div className="flex flex-col gap-1 justify-left w-1/4 items-center">
                      <span className="text-xs  capitalize text-gray-400 hidden md:block">
                        ACTIVE PROPOSALS
                      </span>
                      <span className="text-xs  capitalize text-gray-400 block md:hidden">
                        ACTIVE
                      </span>
                      <span className="text-sm ">{proposals.length}</span>
                    </div>
                    <div className="flex flex-col gap-1 justify-left w-1/4 items-center ">
                      <span className="text-xs  capitalize text-gray-400 hidden md:block">
                        AWAITING EXECUTION
                      </span>
                      <span className="text-xs  capitalize text-gray-400 block md:hidden">
                        EXECUTE
                      </span>
                      <span className="text-sm">
                        {
                          proposals.filter(
                            (proposal) =>
                              proposal.executor_result.toString() ===
                                "PROPOSAL_EXECUTOR_RESULT_NOT_RUN" &&
                              new Date(proposal.voting_period_end) < new Date()
                          ).length
                        }
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 justify-center w-1/4 items-center ">
                      <span className="text-xs  capitalize text-gray-400 hidden md:block">
                        NAUGHTY MEMBER
                      </span>
                      <span className="text-xs  capitalize text-gray-400 block md:hidden">
                        NAUGHTY
                      </span>
                      <span className="block md:hidden truncate">
                        {
                          <TruncatedAddressWithCopy
                            address={address ?? ""}
                            slice={2}
                            size="small"
                          />
                        }
                      </span>
                      <span className="hidden md:block">
                        <TruncatedAddressWithCopy
                          address={address ?? ""}
                          slice={8}
                          size="small"
                        />
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 justify-left w-1/4 items-center ">
                      <span className="text-xs  capitalize text-gray-400 hidden md:block">
                        ENDING SOON
                      </span>
                      <span className="text-xs capitalize text-gray-400 block md:hidden">
                        ENDING
                      </span>
                      <span className="text-sm ">
                        #
                        {proposals
                          .reduce((closest, proposal) => {
                            const proposalDate = new Date(
                              proposal.voting_period_end
                            ).getTime();
                            const closestDate = new Date(
                              closest.voting_period_end
                            ).getTime();

                            return Math.abs(
                              proposalDate - new Date().getTime()
                            ) < Math.abs(closestDate - new Date().getTime())
                              ? proposal
                              : closest;
                          }, proposals[0])
                          ?.id.toString() || "No proposal ending soon"}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Modal({
  proposalId,
  members,
  proposal,
  admin,
  updateTally,
}: {
  proposalId: bigint;
  members: MemberSDKType[];
  proposal: ProposalSDKType;
  admin: string;
  updateTally: (
    proposalId: bigint,
    tally: QueryTallyResultResponseSDKType
  ) => void;
}) {
  const { tally, isTallyLoading, isTallyError, refetchTally } =
    useTallyCount(proposalId);

  useEffect(() => {
    if (tally) {
      updateTally(proposalId, tally);
    }
  }, [tally]);

  const { votes, refetchVotes } = useVotesByProposal(proposalId);

  return (
    <VoteDetailsModal
      admin={admin}
      members={members}
      tallies={tally ?? ({} as QueryTallyResultResponseSDKType)}
      votes={votes}
      proposal={proposal}
      modalId={`vote_modal_${proposal?.id}`}
      refetchVotes={refetchVotes}
      refetchTally={refetchTally}
    />
  );
}
