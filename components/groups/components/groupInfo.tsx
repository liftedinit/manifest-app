import {
  ExtendedQueryGroupsByMemberResponseSDKType,
  useBalance,
} from "@/hooks/useQueries";
import { GroupDetailsModal } from "../modals/groupDetailsModal";
import { TruncatedAddressWithCopy } from "@/components/react/addressCopy";
import Link from "next/link";
import { shiftDigits, truncateString } from "@/utils";
import { Key, useEffect, useState } from "react";
import { PiArrowUpRightLight } from "react-icons/pi";
import { UpdateGroupModal } from "../modals/updateGroupModal";

export function GroupInfo({
  group,
  groupByMemberDataLoading,
  groupByMemberDataError,
  refetchGroupByMember,
  address,
  policyAddress,
}: {
  group: any;
  groupByMemberDataLoading: boolean;
  groupByMemberDataError: Error | null | boolean;
  refetchGroupByMember: () => void;
  address: string;
  policyAddress: string;
}) {
  const { balance } = useBalance(group?.policies?.[0]?.address);

  const renderAuthors = () => {
    if (group?.ipfsMetadata?.authors) {
      if (group.ipfsMetadata.authors.startsWith("manifest")) {
        return (
          <TruncatedAddressWithCopy
            address={group.ipfsMetadata.authors}
            slice={14}
          />
        );
      } else if (group.ipfsMetadata.authors.includes(",")) {
        return (
          <div className="flex flex-wrap gap-2">
            {group.ipfsMetadata.authors
              .split(",")
              .map((author: string, index: Key | null | undefined) => (
                <div key={index}>
                  {author.trim().startsWith("manifest") ? (
                    <TruncatedAddressWithCopy
                      address={author.trim()}
                      slice={14}
                    />
                  ) : (
                    <span>{author.trim()}</span>
                  )}
                </div>
              ))}
          </div>
        );
      } else {
        return <span>{group.ipfsMetadata.authors}</span>;
      }
    } else {
      return <span>No authors available</span>;
    }
  };

  return (
    <div className="flex flex-col max-h-[23rem] relative shadow  min-h-[23rem] rounded-md bg-base-100  w-full p-4">
      <div className="w-full  rounded-md ">
        <div className="px-4 py-2 justify-between items-center border-base-content">
          <div className="flex flex-row w-full justify-between items-center">
            <h3 className="text-lg font-bold leading-6">Info</h3>
            <button
              onClick={() => {
                const modal = document.getElementById(
                  `update_group_${group?.id}`
                ) as HTMLDialogElement;
                modal?.showModal();
              }}
              className="btn-xs btn btn-primary "
            >
              Update
            </button>
          </div>
          <div className="divider divider-horizon -mt-0"></div>
        </div>
        {!group && (
          <div className="p-4 py-24 -mt-4 underline  text-center">
            <p>No group Selected</p>
          </div>
        )}
        {group && (
          <div className="flex flex-col">
            <div className="flex flex-col  gap-3 justify-left px-4 mb-2 -mt-4 rounded-md   items-left">
              <span className="text-sm leading-3 capitalize text-gray-400">
                TITLE
              </span>
              <span className="text-xl leading-3 ">
                {group?.ipfsMetadata?.title ?? "No title available"}
              </span>
            </div>

            <div className="flex  gap-4 px-4   flex-row   py-4 rounded-md  ">
              <div className="flex flex-col   w-1/2 ">
                <div className="flex flex-col gap-2 bg-base-300 p-4 rounded-md  justify-left mb-6 items-left">
                  <span className="text-sm  capitalize text-gray-400 truncate">
                    AUTHORS
                  </span>
                  <div className="text-md truncate">{renderAuthors()}</div>
                </div>

                <div className="flex flex-col gap-2 bg-base-300 p-4 rounded-md  justify-left items-left">
                  <span className="text-sm  capitalize text-gray-400 md:block hidden">
                    POLICY BALANCE
                  </span>
                  <span className="text-sm  capitalize text-gray-400 block md:hidden">
                    BALANCE
                  </span>
                  <div className="flex flex-row gap-1 items-center justify-start truncate">
                    <span className="text-md ">
                      {(balance?.amount && shiftDigits(balance?.amount, -6)) ??
                        "No balance available"}
                    </span>
                    {!balance?.amount && (
                      <div className="loading loading-sm"></div>
                    )}
                    <span className="text-md ">MFX</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col   w-1/2 ">
                <div className="flex flex-col bg-base-300 p-4 rounded-md  gap-2 justify-left mb-6 items-left">
                  <span className="text-sm  capitalize text-gray-400 truncate">
                    POLICY ADDRESS
                  </span>
                  <p className="text-md  ">
                    <TruncatedAddressWithCopy
                      address={
                        group?.policies?.[0]?.address ?? "No address available"
                      }
                      slice={12}
                    />
                  </p>
                </div>
                <div className="flex flex-col bg-base-300 p-4 rounded-md  gap-2 justify-left items-left">
                  <span className="text-sm  capitalize text-gray-400">
                    THRESHOLD
                  </span>
                  <div className="flex flex-row justify-between items-start">
                    <span className="text-md">
                      {group?.policies?.[0]?.decision_policy?.threshold ??
                        "No threshold available"}{" "}
                      / {group?.total_weight ?? "No total weight available"}
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
              policyAddress={policyAddress}
              group={group}
              modalId={`update_group_${group?.id}`}
              address={address}
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
