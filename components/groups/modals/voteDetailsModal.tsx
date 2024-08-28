import React, { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";

import {
  MemberSDKType,
  Proposal,
  ProposalExecutorResult,
  ProposalSDKType,
  ProposalStatus,
  VoteOption,
  VoteSDKType,
} from "@chalabi/manifestjs/dist/codegen/cosmos/group/v1/types";
import { QueryTallyResultResponseSDKType } from "@chalabi/manifestjs/dist/codegen/cosmos/group/v1/query";
import { TruncatedAddressWithCopy } from "@/components/react/addressCopy";
import VotingPopup from "./voteModal";
import { ApexOptions } from "apexcharts";
import { shiftDigits } from "@/utils";
import { useChain } from "@cosmos-kit/react";
import { chainName } from "@/config";
import { useTx } from "@/hooks/useTx";
import { cosmos } from "@chalabi/manifestjs";
import { useTheme } from "@/contexts/theme";
import CountdownTimer from "../components/CountdownTimer";
import { useFeeEstimation } from "@/hooks";
import ScrollableFade from "@/components/react/scrollableFade";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface VoteMap {
  [key: string]: VoteOption;
}

function VoteDetailsModal({
  tallies,
  votes,
  members,
  proposal,
  admin,
  modalId,
  refetchVotes,
  refetchTally,
  refetchProposals,
}: {
  tallies: QueryTallyResultResponseSDKType;
  votes: VoteSDKType[];
  members: MemberSDKType[];
  proposal: ProposalSDKType;
  admin: string;
  modalId: string;
  refetchVotes: () => void;
  refetchTally: () => void;
  refetchProposals: () => void;
}) {
  const voteMap = useMemo(
    () =>
      votes.reduce<VoteMap>((acc, vote) => {
        const voterKey = vote?.voter?.toLowerCase().trim();
        acc[voterKey] = vote?.option;
        return acc;
      }, {}),
    [votes],
  );

  const { address } = useChain(chainName);

  const { theme } = useTheme();

  const textColor = theme === "dark" ? "#E0D1D4" : "#2e2e2e";

  const normalizedMembers = useMemo(
    () =>
      members?.map((member) => ({
        ...member,
      })),
    [members],
  );

  const executorResultMapping: { [key: string]: string } = {
    PROPOSAL_EXECUTOR_RESULT_NOT_RUN: "execute",
    PROPOSAL_EXECUTOR_RESULT_SUCCESS: "success",
    PROPOSAL_EXECUTOR_RESULT_FAILURE: "failed",
  };

  const votingStatusResultMapping: { [key: string]: string } = {
    PROPOSAL_STATUS_CLOSED: "closed",
    PROPOSAL_STATUS_SUBMITTED: "voting",
    PROPOSAL_STATUS_ABORTED: "aborted",
    PROPOSAL_STATUS_ACCEPTED: "accepted",
    PROPOSAL_STATUS_REJECTED: "rejected",
  };

  const voteMapping: { [key: string]: string } = {
    VOTE_OPTION_YES: "yes",
    VOTE_OPTION_NO: "no",
    VOTE_OPTION_NO_WITH_VETO: "veto",
    VOTE_OPTION_ABSTAIN: "abstain",
  };

  const getStatusLabel = (proposal: any) => {
    if (proposal.executor_result === "PROPOSAL_EXECUTOR_RESULT_NOT_RUN") {
      return votingStatusResultMapping[proposal.status] || "unknown status";
    }

    return executorResultMapping[proposal.executor_result] || "unknown status";
  };

  const [chartData, setChartData] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    const yesCount = parseInt(tallies?.tally?.yes_count ?? "0");
    const noCount = parseInt(tallies?.tally?.no_count ?? "0");
    const vetoCount = parseInt(tallies?.tally?.no_with_veto_count ?? "0");
    const abstainCount = parseInt(tallies?.tally?.abstain_count ?? "0");

    setChartData([yesCount, noCount, vetoCount, abstainCount]);
  }, [tallies, votes]);

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: {
        tools: {
          download: false,
        },
      },
    },
    legend: {
      labels: {
        useSeriesColors: true,
      },
      markers: {
        width: 12,
        height: 12,
        radius: 12,
      },
    },
    states: {
      normal: {
        filter: { type: "none", value: 0 },
      },
      hover: {
        filter: { type: "lighten", value: 0.2 },
      },
      active: {
        filter: { type: "darken", value: 0.2 },
        allowMultipleDataPointsSelection: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        distributed: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: false,
    },
    xaxis: {
      categories: ["Yes", "No", "Veto", "Abstain"],
      labels: {
        style: {
          colors: textColor,
        },
      },
    },
    yaxis: {
      min: 0,
      tickAmount: votes.length,
      forceNiceScale: true,
      labels: {
        style: {
          colors: textColor,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    series: [
      {
        data: chartData,
      },
    ],
    colors: ["#78f59599", "#fe6565b0", "#fcd4779a", "#a885f8a1"],
    tooltip: {
      enabled: false,
    },
  };
  const { tx } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);

  const { exec } = cosmos.group.v1.MessageComposer.withTypeUrl;
  const { withdrawProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;

  const msgExec = exec({
    proposalId: proposal?.id,
    executor: address ?? "",
  });

  const msgWithdraw = withdrawProposal({
    proposalId: proposal?.id,
    address: address ?? "",
  });

  const executeProposal = async () => {
    try {
      const fee = await estimateFee(address ?? "", [msgExec]);
      await tx([msgExec], {
        fee,
        onSuccess: () => {
          refetchTally();
          refetchVotes();
          refetchProposals();
          setIsGridVisible(false);
        },
      });
    } catch (error) {
      console.error("Failed to execute proposal: ", error);
    }
  };

  const executeWithdrawl = async () => {
    try {
      const fee = await estimateFee(address ?? "", [msgWithdraw]);
      await tx([msgWithdraw], {
        fee,
        onSuccess: () => {
          refetchTally();
          refetchVotes();
          refetchProposals();
        },
      });
    } catch (error) {
      console.error("Failed to execute proposal: ", error);
    }
  };

  const optionToVote = (option: string) => {
    switch (option) {
      case "VOTE_OPTION_YES":
        return "Yes";
      case "VOTE_OPTION_NO":
        return "No";
      case "VOTE_OPTION_NO_WITH_VETO":
        return "Veto";
      case "VOTE_OPTION_ABSTAIN":
        return "Abstain";
      case undefined:
        return "N/A";
      default:
        return "Unknown";
    }
  };

  const [countdownValues, setCountdownValues] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const endTime = new Date(proposal?.voting_period_end);
  useEffect(() => {
    const calculateTimeParts = () => {
      const now = new Date();

      const timeDiff = endTime.getTime() - now.getTime();

      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        return { days, hours, minutes, seconds };
      } else {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    };

    const timeParts = calculateTimeParts();
    setCountdownValues(timeParts);

    const interval = setInterval(() => {
      const newTimeParts = calculateTimeParts();
      setCountdownValues(newTimeParts);
    }, 1000);

    return () => clearInterval(interval);
  }, [proposal?.voting_period_end]);

  const [isGridVisible, setIsGridVisible] = useState(false);

  const handleButtonClick = () => {
    setIsGridVisible((prev) => !prev);
  };

  const proposalClosed =
    countdownValues.days +
      countdownValues.hours +
      countdownValues.minutes +
      countdownValues.seconds ===
    0;

  const userHasVoted = votes.some(
    (vote) => vote.voter.toLowerCase().trim() === address,
  );

  const userVoteOption = userHasVoted
    ? votes.find((vote) => vote.voter.toLowerCase().trim() === address)?.option
    : null;

  const userVotedStatus = useMemo(() => userHasVoted, [votes]);

  const importantFields: { [key: string]: string[] } = {
    "/cosmos.bank.v1beta1.MsgSend": ["from_address", "to_address", "amount"],
    "/cosmos.group.v1.MsgCreateGroup": ["admin", "members", "metadata"],
    "/cosmos.group.v1.MsgUpdateGroupMembers": [
      "admin",
      "group_id",
      "member_updates",
    ],
    "/cosmos.group.v1.MsgUpdateGroupAdmin": ["group_id", "admin", "new_admin"],
    "/cosmos.group.v1.MsgUpdateGroupMetadata": [
      "admin",
      "group_id",
      "metadata",
    ],
    "/cosmos.group.v1.MsgCreateGroupPolicy": [
      "admin",
      "group_id",
      "metadata",
      "decision_policy",
    ],
    "/cosmos.group.v1.MsgCreateGroupWithPolicy": [
      "admin",
      "members",
      "group_metadata",
      "group_policy_metadata",
      "decision_policy",
    ],
    "/cosmos.group.v1.MsgSubmitProposal": [
      "group_policy_address",
      "proposers",
      "metadata",
      "messages",
    ],
    "/cosmos.group.v1.MsgVote": ["proposal_id", "voter", "option", "metadata"],
    "/cosmos.group.v1.MsgExec": ["proposal_id", "executor"],
    "/cosmos.group.v1.MsgLeaveGroup": ["address", "group_id"],
    // Add more message types and their important fields here
  };

  // Default fields to show if the message type is not in the mapping
  const defaultFields = ["@type"];

  const renderMessageField = (
    key: string,
    value: any,
    depth: number = 0,
  ): JSX.Element => {
    if (typeof value === "object" && value !== null) {
      if (Array.isArray(value)) {
        return (
          <div key={key} style={{ marginLeft: `${depth * 20}px` }}>
            <h4 className="font-medium">{key}:</h4>
            {value.map((item, index) => (
              <div key={index} className="ml-4">
                {renderMessageField(`Item ${index + 1}`, item, depth + 1)}
              </div>
            ))}
          </div>
        );
      } else {
        return (
          <div key={key} style={{ marginLeft: `${depth * 20}px` }}>
            <h4 className="font-medium">{key}:</h4>
            {Object.entries(value).map(([subKey, subValue]) =>
              renderMessageField(subKey, subValue, depth + 1),
            )}
          </div>
        );
      }
    } else {
      return (
        <div key={key} style={{ marginLeft: `${depth * 20}px` }}>
          <h4 className="font-large text-md">{key}:</h4>
          {typeof value === "string" && value.match(/^[a-zA-Z0-9]{40,}$/) ? (
            <TruncatedAddressWithCopy slice={14} address={value} />
          ) : (
            <p>{String(value)}</p>
          )}
        </div>
      );
    }
  };

  return (
    <dialog id={modalId} className="modal">
      <div className="modal-box relative max-w-4xl min-h-96  flex flex-col md:flex-row md:ml-20  rounded-lg shadow">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-1 top-1">
            ✕
          </button>
        </form>
        <div className="flex flex-col flex-grow w-full">
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row gap-2">
              <p>#&nbsp;{proposal?.id.toString()}</p>

              <span className="badge badge-lg items-center shadow-lg justify-center badge-primary">
                {getStatusLabel(proposal)}
              </span>
            </div>
            {userHasVoted && (
              <div className="flex flex-row gap-2 justify-center items-center">
                <span>your vote</span>
                <span
                  className={`items-center justify-center badge badge-lg ${
                    userVoteOption?.toString() === "VOTE_OPTION_YES"
                      ? "bg-green-500/50"
                      : userVoteOption?.toString() === "VOTE_OPTION_NO"
                        ? "bg-red-500/50"
                        : userVoteOption?.toString() ===
                            "VOTE_OPTION_NO_WITH_VETO"
                          ? "bg-yellow-500/50"
                          : userVoteOption?.toString() === "VOTE_OPTION_ABSTAIN"
                            ? "bg-purple-500/50"
                            : ""
                  }`}
                >
                  {userVoteOption !== null
                    ? voteMapping[userVoteOption ?? ""]
                    : null}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-start  items-start">
            <p className="text-md font-light mt-6   text-pretty">TITLE</p>
            <h1 className="text-3xl mb-4">{proposal?.title}</h1>
            <span className="text-md font-light mt-2  ">SUBMITTED</span>
            <span className="text-sm ">
              {new Date(proposal?.submit_time).toDateString().toLocaleString()}
            </span>
          </div>
          <div className="divider divider-vertical"></div>
          <div>
            <p className="text-md font-light  ">SUMMARY</p>
            <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
              <p className="text-md text-pretty">{proposal?.summary}</p>
            </div>
          </div>
          <p className="text-md font-light mt-4">MESSAGES</p>
          <ScrollableFade>
            {proposal.messages.map((message: any, index: number) => {
              const messageType = message["@type"];
              const fieldsToShow =
                importantFields[messageType] || defaultFields;

              return (
                <div
                  key={index}
                  className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2"
                >
                  <h3 className="text-lg font-semibold mb-4">
                    {messageType.split(".").pop().replace("Msg", "")}
                  </h3>
                  <div>
                    {fieldsToShow.map((field) =>
                      renderMessageField(field, message[field]),
                    )}
                  </div>
                </div>
              );
            })}
          </ScrollableFade>

          <div className="mb-4 hidden md:block w-full">
            <p className="text-md font-light mt-4  ">VOTING COUNTDOWN</p>
            <CountdownTimer endTime={new Date(proposal?.voting_period_end)} />
          </div>
        </div>
        <div className="divider divider-horizontal"></div>
        <div className="flex flex-col w-full relative flex-grow items-start justify-start">
          <p className="text-md font-light mt-2  ">TALLY</p>
          <div className="w-full ">
            <Chart
              options={options}
              series={[{ data: chartData }]}
              type="bar"
              height={200}
            />
          </div>
          <p className="text-md font-light mt-4  ">MEMBERS</p>
          <div className="overflow-x-auto w-full min-h-96 max-h-96 rounded-md  overflow-y-auto">
            <table className="min-w-full table-pin-rows shadow mt-4 table-auto text-sm text-left">
              <thead className="text-xs rounded-t-md uppercase ">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Address
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Weight
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Vote
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Mapping over members */}
                {normalizedMembers?.map((member, index) => {
                  const memberVote = voteMap[member?.member.address];
                  return (
                    <tr key={index}>
                      <td className="px-6 py-4">
                        <TruncatedAddressWithCopy
                          slice={8}
                          address={member.member.address}
                        />
                      </td>
                      <td className="px-6 py-4">{member.member.weight}</td>
                      <td className="px-6 py-4">
                        {optionToVote(memberVote?.toString()) || "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mb-4 mt-8 md:hidden block ">
              <p className="text-md font-light mt-4  ">VOTING COUNTDOWN</p>
              <CountdownTimer endTime={new Date(proposal.voting_period_end)} />
            </div>
          </div>
          <div className="w-full relative">
            {proposal.status ===
              ("PROPOSAL_STATUS_ACCEPTED" as unknown as ProposalStatus) &&
            proposal.executor_result ===
              ("PROPOSAL_EXECUTOR_RESULT_NOT_RUN" as unknown as ProposalExecutorResult) ? (
              <button
                className="btn w-full btn-primary ml-auto mt-4"
                onClick={executeProposal}
              >
                Execute
              </button>
            ) : proposal.executor_result ===
                ("PROPOSAL_EXECUTOR_RESULT_NOT_RUN" as unknown as ProposalExecutorResult) &&
              proposalClosed &&
              proposal.status !==
                ("PROPOSAL_STATUS_REJECTED" as unknown as ProposalStatus) ? (
              <button
                className="btn w-full btn-primary ml-auto mt-4"
                onClick={executeProposal}
              >
                Execute
              </button>
            ) : proposal.status !==
                ("PROPOSAL_STATUS_CLOSED" as unknown as ProposalStatus) &&
              !proposalClosed &&
              userHasVoted === false ? (
              <>
                <button
                  disabled={!address || userVotedStatus}
                  className="btn w-full btn-primary ml-auto mt-4 border-r-4 border-r-primaryShadow border-b-4 border-b-primaryShadow"
                  onClick={handleButtonClick}
                >
                  Vote
                </button>
                {proposal.proposers.includes(address ?? "") && (
                  <button
                    className=" absolute top-3 right-[0.3rem] btn btn-xs w-1/8 mx-auto btn-secondary ml-auto mt-2"
                    onClick={executeWithdrawl}
                  >
                    X
                  </button>
                )}
              </>
            ) : proposal.status ===
                ("PROPOSAL_STATUS_REJECTED" as unknown as ProposalStatus) ||
              proposal.executor_result ===
                ("PROPOSAL_EXECUTOR_RESULT_FAILURE" as unknown as ProposalExecutorResult) ||
              (userHasVoted === true &&
                proposal.status !=
                  ("PROPOSAL_STATUS_REJECTED" as unknown as ProposalStatus)) ||
              proposal.executor_result !=
                ("PROPOSAL_EXECUTOR_RESULT_FAILURE" as unknown as ProposalExecutorResult) ? (
              <button
                disabled={!proposal.proposers.includes(address ?? "")}
                className="btn w-full btn-primary ml-auto mt-4"
                onClick={executeWithdrawl}
              >
                Remove
              </button>
            ) : null}
          </div>

          {isGridVisible && !userHasVoted && (
            <VotingPopup
              proposalId={proposal.id}
              isGridVisible={isGridVisible}
              refetch={refetchVotes || refetchTally || refetchProposals}
            />
          )}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

export default VoteDetailsModal;
