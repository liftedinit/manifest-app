import { TruncatedAddressWithCopy } from "@/components/react/addressCopy";
import { IPFSMetadata } from "@/hooks/useQueries";
import ProfileAvatar from "@/utils/identicon";

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
            <div className="divider divider-horizon"></div>
            <div>
              <p className="text-xs font-light mt-4 ">AUTHORS</p>
              <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                <p className="text-md ">{group?.ipfsMetadata?.authors}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-light mt-4 ">SUMMARY</p>
              <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                <p className="text-md ">{group?.ipfsMetadata?.summary}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-light mt-4 ">DETAILS</p>
              <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                <p className="text-md ">{group?.ipfsMetadata?.details}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-light mt-4 ">FORUM</p>
              <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                <p className="text-md ">
                  {group?.ipfsMetadata?.proposalForumURL}
                </p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Policy Details</h3>
            <div className="divider divider-horizon"></div>
            {group?.policies.map((policy, index) => (
              <div key={index} className="mb-2">
                <div>
                  <p className="text-xs font-light mt-4 ">POLICY ADDRESS</p>
                  <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                    {" "}
                    <TruncatedAddressWithCopy
                      address={policy?.address}
                      slice={28}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-light mt-4 ">VOTING WINDOW</p>
                  <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                    <p className="text-md ">
                      {" "}
                      {Math.floor(
                        parseInt(
                          policy.decision_policy.windows.voting_period.slice(
                            0,
                            -1
                          )
                        ) / 86400
                      )}{" "}
                      days
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-light mt-4 ">THRESHOLD</p>
                  <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                    <p className="text-md ">
                      {" "}
                      {policy.decision_policy.threshold} /{" "}
                      {group?.members.length}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-light mt-4 ">CREATED</p>
                  <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                    {new Intl.DateTimeFormat(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      hour12: false,
                    }).format(new Date(policy.created_at))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-4">
          <h3 className="text-lg font-semibold">Members</h3>
          <div className="divider divider-horizon"></div>
          <div className="overflow-x-auto -mt-4 max-h-52">
            <table className="table table-pin-rows w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Member Info</th>
                  <th>Address</th>
                  <th>Weight</th>
                </tr>
              </thead>
              <tbody>
                {group?.members.map((member, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{member.member?.metadata}</td>
                    <td>
                      <TruncatedAddressWithCopy
                        address={member?.member?.address}
                        slice={12}
                      />
                    </td>
                    <td>{member.member?.weight}</td>
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
