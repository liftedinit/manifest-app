import { TruncatedAddressWithCopy } from "@/components/react/addressCopy";
import { IPFSMetadata } from "@/hooks/useQueries";
import ProfileAvatar from "@/utils/identicon";
import { PiXCircleLight } from "react-icons/pi";

interface Group {
  group: {
    admin: string;
    metadata: string;
    ipfsMetadata: IPFSMetadata | null;
    members: any[];
    policies: any[];
  };
}

export function GroupDetailsModal({
  group,
  modalId,
}: Group & { modalId: string }) {
  const isAdmin = (address: string) => {
    const adminAddresses = [group.admin].filter(Boolean);
    return adminAddresses.includes(address);
  };

  const isPolicyAdmin = (address: string) => {
    const adminAddresses = [group.policies[0]?.admin].filter(Boolean);
    return adminAddresses.includes(address);
  };

  return (
    <dialog id={modalId} className="modal">
      <div className="modal-box absolute max-w-4xl mx-auto rounded-lg md:ml-20 shadow-lg">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-1 top-1">
            ✕
          </button>
        </form>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div>
            <h3 className="text-lg font-semibold">Group Details</h3>
            <div className="divider divider-horizon -mt-0"></div>
            <div>
              <p className="text-sm font-light mt-4 ">AUTHORS</p>
              <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                <p className="text-md ">
                  {group?.ipfsMetadata?.authors ?? "No authors available"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-light mt-4 ">SUMMARY</p>
              <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                <p className="text-md ">
                  {group?.ipfsMetadata?.summary ?? "No summary available"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-light mt-4 ">DETAILS</p>
              <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2 max-h-[9.53rem] overflow-y-auto">
                <p className="text-md text-wrap ">
                  {group?.ipfsMetadata?.details ?? "No details available"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-light mt-4 ">FORUM</p>
              <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                <p className="text-md ">
                  {group?.ipfsMetadata?.proposalForumURL ??
                    "No forum URL available"}
                </p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Policy Details</h3>
            <div className="divider divider-horizon -mt-0"></div>
            {group?.policies.map((policy, index) => (
              <div key={index} className="mb-2">
                <div>
                  <p className="text-sm font-light mt-4 ">POLICY ADDRESS</p>
                  <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                    {" "}
                    <TruncatedAddressWithCopy
                      address={policy?.address ?? "No address available"}
                      slice={28}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-light mt-4 ">VOTING WINDOW</p>
                  <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                    <p className="text-md ">
                      {policy?.decision_policy?.windows?.voting_period
                        ? Math.floor(
                            parseInt(
                              policy.decision_policy.windows.voting_period.slice(
                                0,
                                -1
                              )
                            ) / 86400
                          )
                        : "No voting period available"}{" "}
                      days
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-light mt-4 ">THRESHOLD</p>
                  <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                    <p className="text-md ">
                      {policy?.decision_policy?.threshold ??
                        "No threshold available"}{" "}
                      /{group?.members.length ?? "No members available"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-light mt-4 ">CREATED</p>
                  <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                    {policy?.created_at
                      ? new Intl.DateTimeFormat(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                          hour12: false,
                        }).format(new Date(policy.created_at))
                      : "No creation date available"}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-light mt-4 ">ADMIN</p>
                  <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2 text-md">
                      <TruncatedAddressWithCopy
                        address={group.admin ?? ""}
                        slice={28}
                      />{" "}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-4">
          <h3 className="text-lg font-semibold">Members</h3>
          <div className="divider divider-horizon -mt-0"></div>
          <div className="overflow-x-auto -mt-4 max-h-52">
            <table className="table table-pin-rows w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Member Info</th>
                  <th>Address</th>
                  <th>Admin</th>
                  <th>Weight</th>
                </tr>
              </thead>
              <tbody>
                {group?.members.map((member, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      {member?.member?.metadata ?? "No metadata available"}
                    </td>
                    <td>
                      <TruncatedAddressWithCopy
                        address={
                          member?.member?.address ?? "No address available"
                        }
                        slice={12}
                      />
                    </td>
                    <td>
                      {isPolicyAdmin(member?.member?.address) &&
                      isAdmin(member?.member?.address) ? (
                        "Super Admin"
                      ) : isPolicyAdmin(member?.member?.address) ? (
                        "Policy"
                      ) : isAdmin(member?.member?.address) ? (
                        "Group"
                      ) : (
                        <PiXCircleLight className="text-red-500 h-5 w-5" />
                      )}
                    </td>
                    <td>{member?.member?.weight ?? "No weight available"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
