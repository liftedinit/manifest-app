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
}: {
  tallies: QueryTallyResultResponseSDKType;
  votes: VoteSDKType[];
  members: MemberSDKType[];
  proposal: Proposal;
  admin: string;
  modalId: string;
  refetchVotes: () => void;
  refetchTally: () => void;
}) {
  const voteMap = useMemo(
    () =>
      votes.reduce<VoteMap>((acc, vote) => {
        const voterKey = vote?.voter?.toLowerCase().trim();
        acc[voterKey] = vote?.option;
        return acc;
      }, {}),
    [votes]
  );

  const { address } = useChain(chainName);

  const series = [
    {
      name: "Votes",
      data: [
        tallies.tally?.yes_count,
        tallies.tally?.no_count,
        tallies.tally?.no_with_veto_count,
        tallies.tally?.abstain_count,
      ].map((count) => Number(count) || 0),
    },
  ];

  const normalizedMembers = useMemo(
    () =>
      members?.map((member) => ({
        ...member,
        address: member?.address?.toLowerCase().trim(),
      })),
    [members]
  );

  const executorResultMapping = {
    PROPOSAL_EXECUTOR_RESULT_NOT_RUN: "execute",
    PROPOSAL_EXECUTOR_RESULT_SUCCESS: "success",
    PROPOSAL_EXECUTOR_RESULT_FAILURE: "failed",
  };

  const votingStatusResultMapping = {
    PROPOSAL_STATUS_CLOSED: "closed",
    PROPOSAL_STATUS_SUBMITTED: "voting",
    PROPOSAL_EXECUTOR_RESULT_FAILURE: "failed",
  };

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
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: ["Yes", "No", "Veto", "Abstain"],
      labels: {
        style: {
          colors: ["", "#f4f4f4", "#f4f4f4", "#f4f4f4"],
        },
      },
    },
    yaxis: {
      min: 0,
      tickAmount: 1,
      forceNiceScale: true,
      labels: {
        style: {
          colors: "#f4f4f4",
        },
      },
    },
    fill: {
      opacity: 1,
      colors: ["#23cf42", "#f64b4b", "#e2b957", "#9d78f5"],
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val + " votes";
        },
      },
    },
    colors: ["#23cf42", "#f64b4b", "#e2b957", "#9d78f5"],
  };

  const { tx } = useTx("manifest");

  const { exec } = cosmos.group.v1.MessageComposer.withTypeUrl;

  const msg = exec({
    proposal_id: proposal?.id,
    signer: address ?? "",
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

  const executeProposal = async () => {
    try {
      await tx([msg], {
        fee,
        onSuccess: () => {
          refetchTally();
          refetchVotes();
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
          (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
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

  return (
    <dialog id={modalId} className="modal">
      <div className="modal-box relative max-w-4xl min-h-96  flex flex-col md:flex-row md:ml-20  rounded-lg shadow">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-1 top-1">
            ✕
          </button>
        </form>
        <div className="flex flex-col flex-grow w-full">
          <div className="flex flex-row gap-2 items-center">
            <p>#&nbsp;{proposal?.id.toString()}</p>
            <span className="badge badge-lg items-center justify-center badge-primary">
              {proposal?.status !==
              ("PROPOSAL_STATUS_SUBMITTED" as unknown as ProposalStatus)
                ? executorResultMapping[
                    proposal?.executor_result as unknown as keyof typeof executorResultMapping
                  ]
                : "active"}
            </span>
          </div>
          <div className="flex flex-col justify-start  items-start">
            <p className="text-xs font-light mt-6">TITLE</p>
            <h1 className="text-3xl mb-4">{proposal?.title}</h1>
            <span className="text-xs font-light mt-2">SUBMITTED</span>
            <span className="text-sm ">
              {new Date(proposal?.submit_time).toDateString().toLocaleString()}
            </span>
          </div>
          <div className="divider divider-vertical"></div>
          <div>
            <p className="text-xs font-light ">SUMMARY</p>
            <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
              <p className="text-md ">{proposal?.summary}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-light mt-4 ">MESSAGE</p>
            {proposal.messages.map((message: any, index: number) => (
              <div
                key={index}
                className="bg-base-200 shadow  rounded-lg p-4 mt-2 mb-2"
              >
                <h3 className="text-lg font-semibold mb-4">
                  {message["@type"] === "/cosmos.bank.v1beta1.MsgSend"
                    ? "Message Send"
                    : message["@type"]}
                </h3>
                {message["@type"] === "/cosmos.bank.v1beta1.MsgSend" && (
                  <div className="grid grid-rows-3 gap-4">
                    <div>
                      <h4 className="font-medium">From:</h4>
                      <TruncatedAddressWithCopy
                        slice={14}
                        address={message?.from_address}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">To:</h4>
                      <TruncatedAddressWithCopy
                        slice={14}
                        address={message?.to_address}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">Amount:</h4>
                      {message?.amount?.map((amount: any, idx: number) => (
                        <p key={idx}>
                          {shiftDigits(amount?.amount, -6)}{" "}
                          {amount?.denom.slice(1).toUpperCase()}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mb-4 hidden md:block w-full">
            <p className="text-xs font-light mt-4 ">VOTING COUNTDOWN</p>
            <div className="grid grid-flow-col gap-5 mt-2 text-center auto-cols-max">
              <div className="flex flex-col">
                <span className="countdown  text-xl">
                  <span
                    style={
                      { "--value": countdownValues.days } as React.CSSProperties
                    }
                  ></span>
                </span>
                days
              </div>
              <div className="flex flex-col ">
                <span className="countdown  text-xl">
                  <span
                    style={
                      {
                        "--value": countdownValues.hours,
                      } as React.CSSProperties
                    }
                  ></span>
                </span>
                hours
              </div>
              <div className="flex flex-col">
                <span className="countdown  text-xl">
                  <span
                    style={
                      {
                        "--value": countdownValues.minutes,
                      } as React.CSSProperties
                    }
                  ></span>
                </span>
                min
              </div>
              <div className="flex flex-col">
                <span className="countdown  text-xl">
                  <span
                    style={
                      {
                        "--value": countdownValues.seconds,
                      } as React.CSSProperties
                    }
                  ></span>
                </span>
                sec
              </div>
            </div>
          </div>
        </div>
        <div className="divider divider-horizontal"></div>
        <div className="flex flex-col w-full relative flex-grow items-start justify-start">
          <p className="text-xs font-light mt-2">TALLY</p>
          <div className="w-full">
            <Chart options={options} series={series} type="bar" height={200} />
          </div>
          <p className="text-xs font-light mt-4">MEMBERS</p>
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
                  const memberVote = voteMap[member?.member?.address];
                  return (
                    <tr key={index}>
                      <td className="px-6 py-4">
                        <TruncatedAddressWithCopy
                          slice={8}
                          address={member?.member?.address}
                        />
                      </td>
                      <td className="px-6 py-4">{member?.member?.weight}</td>
                      <td className="px-6 py-4">
                        {optionToVote(memberVote?.toString()) || "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mb-4 mt-8 md:hidden block ">
              <p className="text-xs font-light mt-4 ">VOTING COUNTDOWN</p>
              <div className="grid grid-flow-col md:hidden gap-5 mt-2 text-center auto-cols-max">
                <div className="flex flex-col">
                  <span className="countdown  text-xl">
                    <span
                      style={
                        {
                          "--value": countdownValues.days,
                        } as React.CSSProperties
                      }
                    ></span>
                  </span>
                  days
                </div>
                <div className="flex flex-col">
                  <span className="countdown  text-xl">
                    <span
                      style={
                        {
                          "--value": countdownValues.hours,
                        } as React.CSSProperties
                      }
                    ></span>
                  </span>
                  hours
                </div>
                <div className="flex flex-col">
                  <span className="countdown  text-xl">
                    <span
                      style={
                        {
                          "--value": countdownValues.minutes,
                        } as React.CSSProperties
                      }
                    ></span>
                  </span>
                  min
                </div>
                <div className="flex flex-col">
                  <span className="countdown  text-xl">
                    <span
                      style={
                        {
                          "--value": countdownValues.seconds,
                        } as React.CSSProperties
                      }
                    ></span>
                  </span>
                  sec
                </div>
              </div>
            </div>
          </div>
          {proposal.executor_result ===
            ("PROPOSAL_EXECUTOR_RESULT_NOT_RUN" as unknown as ProposalExecutorResult) &&
            countdownValues.days +
              countdownValues.hours +
              countdownValues.minutes +
              countdownValues.seconds ===
              0 && (
              <button
                className="btn w-full btn-primary ml-auto mt-4"
                disabled={address !== admin}
                onClick={executeProposal}
              >
                Execute
              </button>
            )}
          {isGridVisible && (
            <VotingPopup
              proposalId={proposal.id}
              isGridVisible={isGridVisible}
            />
          )}
          {proposal.status !==
            ("PROPOSAL_STATUS_CLOSED" as unknown as ProposalStatus) && (
            <button
              disabled={!address}
              className="btn w-full btn-primary ml-auto mt-4 border-r-4 border-r-primaryShadow border-b-4 border-b-primaryShadow"
              onClick={handleButtonClick}
            >
              Vote
            </button>
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
