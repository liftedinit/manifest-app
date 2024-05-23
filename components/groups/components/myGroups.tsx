import { ExtendedQueryGroupsByMemberResponseSDKType } from "@/hooks/useQueries";

import ProfileAvatar from "@/utils/identicon";
import { truncateString } from "@/utils";
import { useEffect, useState } from "react";

export function YourGroups({
  groups,
  groupByMemberDataLoading,
  groupByMemberDataError,
  refetchGroupByMember,
  onSelectGroup,
  proposals,
}: {
  groups: ExtendedQueryGroupsByMemberResponseSDKType;
  groupByMemberDataLoading: boolean;
  groupByMemberDataError: Error | null | boolean;
  refetchGroupByMember: () => void;
  onSelectGroup: (policyAddress: string) => void;
  proposals: any;
}) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedGroup && groups.groups.length > 0) {
      setSelectedGroup(groups.groups[0].policies[0].address);
      onSelectGroup(groups.groups[0].policies[0].address);
    }
  }, [groups]);

  const handleGroupSelect = (policyAddress: string) => {
    setSelectedGroup(policyAddress);
    onSelectGroup(policyAddress);
  };

  const renderSkeleton = () => (
    <>
      <div className="py-8">
        <div className="skeleton rounded-md mx-auto h-16 w-5/6"></div>
      </div>
    </>
  );

  return (
    <div className="flex flex-col rounded-md max-h-[23rem]  min-h-[23rem] bg-base-100  shadow w-full p-4">
      <div className="w-full rounded-md ">
        <div className="px-4 py-2 border-b border-base-content">
          <h3 className="text-lg font-bold leading-6">my groups</h3>
        </div>
        <div className="overflow-y-auto max-h-[17rem] mt-2 mb-2 gap-4">
          {groupByMemberDataLoading ? renderSkeleton() : null}
          {groups?.groups?.map((group, index) => {
            const policyAddress = group.policies[0]?.address;

            return (
              <div
                key={index}
                className={` relative flex flex-row justify-between rounded-md  mb-4 mt-2  items-center px-4 py-2  hover:cursor-pointer transition-all duration-200 ${
                  selectedGroup === policyAddress
                    ? "bg-primary border-r-4 border-r-[#263c3add] border-b-[#263c3add] border-b-4 "
                    : "bg-base-300 border-r-4 border-r-base-200 border-b-base-200 border-b-4 active:scale-95 hover:bg-base-200"
                }`}
                onClick={() => handleGroupSelect(policyAddress)}
              >
                {proposals[group?.policies[0]?.address ?? ""]?.length > 0 && (
                  <div className="absolute top-1 shadow-inner right-1 w-5 h-5 text-sm rounded-full bg-secondary flex justify-center items-center">
                    <span className="text-center">
                      {proposals[group?.policies[0]?.address ?? ""]?.length}
                    </span>
                  </div>
                )}

                <ProfileAvatar
                  walletAddress={group.created_at.toString() ?? ""}
                />
                <div className="ml-2 flex-grow">
                  <h5 className="text-base font-medium truncate">
                    {truncateString(
                      group.ipfsMetadata?.title ?? "Untitled Group",
                      24
                    )}
                  </h5>
                </div>
              </div>
            );
          })}
          {!groupByMemberDataLoading &&
            !groupByMemberDataError &&
            groups?.groups?.length === 0 && (
              <div className="text-center mt-6">No groups found</div>
            )}
        </div>
      </div>
    </div>
  );
}
