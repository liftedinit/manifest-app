import { ExtendedQueryGroupsByMemberResponseSDKType } from "@/hooks/useQueries";

import { GroupDetailsModal } from "../modals/groupDetailsModal";

import ProfileAvatar from "@/utils/identicon";

export function YourGroups({
  groups,
  groupByMemberDataLoading,
  groupByMemberDataError,
}: {
  groups: ExtendedQueryGroupsByMemberResponseSDKType;
  groupByMemberDataLoading: boolean;
  groupByMemberDataError: Error | null | boolean;
}) {
  const renderSkeleton = () => (
    <>
      <div className=" py-8">
        <div className="skeleton rounded-md mx-auto h-16 w-5/6 "></div>
      </div>
    </>
  );

  return (
    <div className="flex flex-col rounded-md  bg-primary/50 justify-center w-1/2 p-4 items-center mt-4 mb-4 ">
      <div className="w-full  rounded-md min-h-36 max-h-48">
        <div className="px-4 py-5 border-b border-gray-200">
          <h3 className="text-lg font-bold  leading-6 ">Your Groups</h3>
        </div>
        <div className="overflow-y-auto mt-2 mb-2  ">
          {groupByMemberDataLoading ? renderSkeleton() : null}

          {groups?.groups?.map((group, index) => (
            <div
              key={index}
              className="flex flex-row justify-between rounded-md bg-primary/20 hover:bg-primary/40  items-center px-4 py-2 border-b border-gray-200 last:border-b-0"
            >
              <ProfileAvatar walletAddress={group.admin ?? ""} />
              <div className=" ml-4 flex-grow">
                <h5 className="text-base font-medium ">
                  {group.ipfsMetadata?.title || "Untitled Group"}
                </h5>
              </div>
              <button
                className="btn-sm btn"
                onClick={() =>
                  (
                    document.getElementById("my_modal_1") as HTMLDialogElement
                  )?.showModal()
                }
              >
                Info
              </button>
              <GroupDetailsModal group={group} />
            </div>
          ))}
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
