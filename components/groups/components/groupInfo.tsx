import {
  ExtendedQueryGroupsByMemberResponseSDKType,
  useBalance,
  useProposalsByPolicyAccount,
  useTallyCount,
  useVotesByProposal,
} from "@/hooks/useQueries";
import { GroupDetailsModal } from "../modals/groupDetailsModal";
import ProfileAvatar from "@/utils/identicon";
import VoteDetailsModal from "../modals/voteDetailsModal";
import { QueryTallyResultResponseSDKType } from "@chalabi/manifestjs/dist/codegen/cosmos/group/v1/query";
import {
  MemberSDKType,
  ProposalSDKType,
} from "@chalabi/manifestjs/dist/codegen/cosmos/group/v1/types";

import { TruncatedAddressWithCopy } from "@/components/react/addressCopy";
import Link from "next/link";
import { shiftDigits, truncateString } from "@/utils";
import { useEffect, useState } from "react";
import { PiArrowDownLight, PiArrowUpRightLight } from "react-icons/pi";
import { UpdateGroupModal } from "../modals/updateGroupModal";

export function Proposals({
  group,
  groupByMemberDataLoading,
  groupByMemberDataError,
  refetchGroupByMember,
}: {
  group: any;
  groupByMemberDataLoading: boolean;
  groupByMemberDataError: Error | null | boolean;
  refetchGroupByMember: () => void;
}) {
  const { balance } = useBalance(group?.policies[0]?.address);

  return (
    <div className="flex flex-col max-h-[23rem] relative shadow  min-h-[23rem] rounded-md bg-base-100 border-r-4 border-r-base-300 border-b-4 border-b-base-300 w-full p-4">
      <div className="w-full  rounded-md ">
        <div className="px-4 py-2 justify-between items-center border-b border-base-content">
          <div className="flex flex-row w-full justify-between items-center">
            <h3 className="text-lg font-bold leading-6">info</h3>
            <button
              onClick={() => {
                const modal = document.getElementById(
                  `update_group_${group?.id}`
                ) as HTMLDialogElement;
                modal?.showModal();
              }}
              className="btn-xs btn btn-primary "
            >
              update
            </button>
          </div>
        </div>
        {!group && (
          <div className="p-4 mt-6 py-24 underline  text-center">
            <p>No group Selected</p>
          </div>
        )}
        {group && (
          <div className="flex flex-col">
            <div className="flex flex-col  gap-2 justify-left px-4 mb-2 mt-6 rounded-md   items-left">
              <span className="text-sm leading-3 capitalize text-gray-400">
                TITLE
              </span>
              <span className="text-xl leading-3 ">
                {group?.ipfsMetadata.title}
              </span>
            </div>

            <div className="flex  gap-4 px-4   flex-row   py-4 rounded-md  ">
              <div className="flex flex-col   w-1/2 ">
                <div className="flex flex-col gap-2 bg-base-300 p-4 rounded-md border-r-base-200 border-b-base-200 border-r-4 border-b-4 justify-left mb-6 items-left">
                  <span className="text-sm  capitalize text-gray-400 truncate">
                    AUTHORS
                  </span>
                  <span className="text-md truncate">
                    {group?.ipfsMetadata.authors}
                  </span>
                </div>

                <div className="flex flex-col gap-2 bg-base-300 p-4 rounded-md border-r-base-200 border-b-base-200 border-r-4 border-b-4  justify-left items-left">
                  <span className="text-sm  capitalize text-gray-400 md:block hidden">
                    POLICY BALANCE
                  </span>
                  <span className="text-sm  capitalize text-gray-400 block md:hidden">
                    BALANCE
                  </span>
                  <div className="flex flex-row gap-1 items-center justify-start truncate">
                    <span className="text-md ">
                      {balance?.amount && shiftDigits(balance?.amount, -6)}
                    </span>
                    {!balance?.amount && (
                      <div className="loading loading-sm"></div>
                    )}
                    <span className="text-md ">MFX</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col   w-1/2 ">
                <div className="flex flex-col bg-base-300 p-4 rounded-md border-r-base-200 border-b-base-200 border-r-4 border-b-4  gap-2 justify-left mb-6 items-left">
                  <span className="text-sm  capitalize text-gray-400 truncate">
                    POLICY ADDRESS
                  </span>
                  <p className="text-md  ">
                    <TruncatedAddressWithCopy
                      address={group.policies[0].address}
                      slice={12}
                    />
                  </p>
                </div>
                <div className="flex flex-col bg-base-300 p-4 rounded-md border-r-base-200 border-b-base-200 border-r-4 border-b-4  gap-2 justify-left items-left">
                  <span className="text-sm  capitalize text-gray-400">
                    THRESHOLD
                  </span>
                  <div className="flex flex-row justify-between items-start">
                    <span className="text-md">
                      {group?.policies[0]?.decision_policy?.threshold} /{" "}
                      {group?.total_weight}
                    </span>

                    <div className="flex-row  justify-between items-center gap-2 hidden md:flex">
                      <button
                        className="btn btn-xs btn-secondary "
                        onClick={() => {
                          const modal = document.getElementById(
                            `group_modal_${group?.id}`
                          ) as HTMLDialogElement;
                          modal?.showModal();
                        }}
                      >
                        more info <PiArrowUpRightLight />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <UpdateGroupModal
              group={group}
              modalId={`update_group_${group?.id}`}
            />
            <GroupDetailsModal
              group={group}
              modalId={`group_modal_${group?.id}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
