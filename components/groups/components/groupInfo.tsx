import { useBalance } from '@/hooks/useQueries';
import { GroupDetailsModal, UpdateGroupModal } from '@/components';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { shiftDigits } from '@/utils';
import { Key } from 'react';
import { PiArrowUpRightLight } from 'react-icons/pi';

export function GroupInfo({
  group,
  address,
  policyAddress,
}: Readonly<{
  group: any; // TODO: Define type
  groupByMemberDataLoading: boolean;
  groupByMemberDataError: Error | null | boolean;
  refetchGroupByMember: () => void;
  address: string;
  policyAddress: string;
}>) {
  // TODO: The policy address is passed to this component but we still use `group.policies?.[0]?.address` to get the policy address

  const maybeAuthors = group?.ipfsMetadata?.authors;
  const maybePolicies = group?.policies?.[0];

  const threshold = maybePolicies?.decision_policy?.threshold ?? 'No threshold available';

  const { balance } = useBalance(maybePolicies?.address);

  const renderAuthors = () => {
    if (maybeAuthors) {
      if (maybeAuthors.startsWith('manifest')) {
        return <TruncatedAddressWithCopy address={maybeAuthors} slice={14} />;
      } else if (maybeAuthors.includes(',')) {
        return (
          <div className="flex flex-wrap gap-2">
            {maybeAuthors.split(',').map((author: string, index: Key | null | undefined) => (
              <div key={index}>
                {author.trim().startsWith('manifest') ? (
                  <TruncatedAddressWithCopy address={author.trim()} slice={14} />
                ) : (
                  <span>{author.trim()}</span>
                )}
              </div>
            ))}
          </div>
        );
      } else {
        return <span>{maybeAuthors}</span>;
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
              aria-label="update-btn"
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
              <span className="text-sm leading-3 capitalize text-gray-400">TITLE</span>
              <span className="text-xl leading-3 ">
                {group?.ipfsMetadata?.title ?? 'No title available'}
              </span>
            </div>

            <div className="flex  gap-4 px-4   flex-row   py-4 rounded-md  ">
              <div className="flex flex-col   w-1/2 ">
                <div className="flex flex-col gap-2 bg-base-300 p-4 rounded-md  justify-left mb-6 items-left">
                  <span className="text-sm  capitalize text-gray-400 truncate">AUTHORS</span>
                  <div className="text-md truncate">{renderAuthors()}</div>
                </div>

                <div className="flex flex-col gap-2 bg-base-300 p-4 rounded-md  justify-left items-left">
                  <span className="text-sm  capitalize text-gray-400 md:block hidden">
                    POLICY BALANCE
                  </span>
                  <span className="text-sm  capitalize text-gray-400 block md:hidden">BALANCE</span>
                  <div className="flex flex-row gap-1 items-center justify-start truncate">
                    <span className="text-md ">
                      {(balance?.amount && shiftDigits(balance?.amount, -6)) ??
                        'No balance available'}
                    </span>
                    {!balance?.amount && <div className="loading loading-sm"></div>}
                    <span className="text-md ">MFX</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col   w-1/2 ">
                <div className="flex flex-col bg-base-300 p-4 rounded-md  gap-2 justify-left mb-6 items-left">
                  <span className="text-sm  capitalize text-gray-400 truncate">POLICY ADDRESS</span>
                  <span className="text-md  ">
                    <TruncatedAddressWithCopy
                      address={group?.policies?.[0]?.address ?? 'No address available'}
                      slice={12}
                    />
                  </span>
                </div>
                <div className="flex flex-col bg-base-300 p-4 rounded-md  gap-2 justify-left items-left">
                  <span className="text-sm  capitalize text-gray-400">THRESHOLD</span>
                  <div className="flex flex-row justify-between items-start">
                    <span className="text-md">
                      {maybePolicies.decision_policy?.threshold && group?.total_weight
                        ? `${maybePolicies.decision_policy.threshold} / ${group.total_weight}`
                        : maybePolicies.decision_policy?.threshold
                          ? 'No total weight available'
                          : 'No threshold available'}
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
            <GroupDetailsModal group={group} modalId={`group_modal_${group?.id}`} />
          </div>
        )}
      </div>
    </div>
  );
}
