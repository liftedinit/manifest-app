import {
  AddressWithCopy,
  TruncatedAddressWithCopy,
} from "@/components/react/addressCopy";
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

export function GroupDetailsModal({ group }: Group) {
  console.log(group.policies);
  return (
    <dialog id="my_modal_1" className="modal">
      <div className="">
        <div className="modal-box relative  max-w-2xl mx-auto items-center justify-center rounded-lg shadow ">
          <div className="flex p-4 justify-between mb-4 rounded-t sm:mb-5">
            <div className="flex items-center">
              <ProfileAvatar walletAddress={group.admin ?? ""} />
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900 md:text-xl dark:text-white">
                  {group?.ipfsMetadata?.title}
                </h3>
                <p className="text-base font-light text-gray-500 dark:text-gray-400">
                  Group Title
                </p>
              </div>
            </div>
          </div>
          <div className="grid md:gap-8 p-4 mb-4 sm:grid-cols-2  sm:mb-5 sm:gap-0">
            <dl>
              <dt className="mb-2 leading-none text-gray-500 dark:text-gray-400">
                Authors
              </dt>
              <dd className="mb-4 font-medium text-gray-900 sm:mb-5 dark:text-white">
                {group?.ipfsMetadata?.authors}
              </dd>
              <dt className="mb-2 leading-none text-gray-500 dark:text-gray-400">
                Summary
              </dt>
              <dd className="mb-4 font-medium text-gray-900 sm:mb-5 dark:text-white">
                {group?.ipfsMetadata?.summary}
              </dd>
              <dt className="mb-2 leading-none text-gray-500 dark:text-gray-400">
                Admin
              </dt>
              <dd className="font-medium mb-4 text-gray-900 dark:text-white">
                <TruncatedAddressWithCopy address={group.admin} />
              </dd>
              <dt className="mb-2 leading-none text-gray-500 dark:text-gray-400">
                Group Wallet
              </dt>
              <dd className="font-medium mb-4 text-gray-900 dark:text-white overflow-x-scroll">
                {group.policies.map((policy, index) => (
                  <TruncatedAddressWithCopy
                    key={index}
                    address={policy.address}
                  />
                ))}
              </dd>
              <dt className="mb-2 leading-none text-gray-500 dark:text-gray-400">
                Voting Window
              </dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {group.policies.map((policy, index) => {
                  const seconds = parseInt(
                    policy?.decision_policy.windows.voting_period.slice(0, -1)
                  );
                  const days = Math.floor(seconds / 86400);

                  return <div key={index}>{days} days</div>;
                })}
              </dd>
            </dl>
            <dl>
              <dt className="mb-2 leading-none text-gray-500 dark:text-gray-400">
                Details
              </dt>
              <dd className="font-medium mb-4 text-gray-900 dark:text-white">
                {group?.ipfsMetadata?.details}
              </dd>
              <dt className="mb-2 leading-none text-gray-500 dark:text-gray-400">
                Forum
              </dt>
              <dd className="font-medium mb-4 text-gray-900 dark:text-white">
                {group?.ipfsMetadata?.proposalForumURL}
              </dd>
              <dt className="mb-2 leading-none text-gray-500 dark:text-gray-400">
                Threshold
              </dt>
              <dd className="font-medium mb-4 text-gray-900 dark:text-white">
                {group.policies.map((policy, index) => (
                  <div key={index}>
                    {policy?.decision_policy.threshold} / {group.members.length}
                  </div>
                ))}
              </dd>
              <dt className="mb-2 leading-none text-gray-500 dark:text-gray-400">
                Creation Date
              </dt>
              <dd className="font-medium mb-4 text-gray-900 dark:text-white">
                {group.policies.map((policy, index) => {
                  const date = new Date(policy?.created_at);
                  const formattedDate = new Intl.DateTimeFormat(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",

                    hour12: false,
                  }).format(date);

                  return <div key={index}>{formattedDate}</div>;
                })}
              </dd>
            </dl>
          </div>
          <dt className=" px-4  leading-none text-gray-500 dark:text-gray-400">
            Members
          </dt>
          <dd className="font-medium text-gray-900 dark:text-white">
            <div className="overflow-x-auto overflow-y-auto max-h-40">
              <table className="table">
                {/* head */}
                <thead>
                  <tr></tr>
                </thead>
                <tbody>
                  {group.members.map((member, index) => (
                    <tr key={index}>
                      <th>{index + 1}</th>
                      <td>{member.member.metadata}</td>
                      <td>
                        {" "}
                        <AddressWithCopy
                          key={index}
                          address={member.member.address}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </dd>

          <div className="flex items-end justify-items-end">
            <div className="modal-action">
              <form method="dialog">
                <button className="btn btn-primary">Close</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
