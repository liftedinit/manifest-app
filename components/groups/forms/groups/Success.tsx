import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { FormData } from '@/helpers';
import Link from 'next/link';
import { secondsToHumanReadable } from '@/utils/string';
import { useGroupsByMember } from '@/hooks';

export default function Success({
  formData,
  address,
}: Readonly<{
  formData: FormData;
  address: string;
}>) {
  const renderAuthors = () => {
    if (Array.isArray(formData.authors)) {
      return formData.authors.map((author, index) => (
        <div
          key={index}
          className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-lg flex items-center"
        >
          {author.trim().startsWith('manifest') ? (
            <TruncatedAddressWithCopy address={author.trim()} slice={14} />
          ) : (
            <span>{author.trim()}</span>
          )}
        </div>
      ));
    } else {
      return (
        <div className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-lg flex items-center">
          {formData.authors.trim().startsWith('manifest') ? (
            <TruncatedAddressWithCopy address={formData.authors.trim()} slice={14} />
          ) : (
            <span>{formData.authors.trim()}</span>
          )}
        </div>
      );
    }
  };

  const { groupByMemberData } = useGroupsByMember(address);
  const recentGroup = groupByMemberData?.groups[groupByMemberData.groups.length - 1];

  return (
    <section>
      <div className="w-full dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC] p-[24px] rounded-[24px]">
        <div className="flex justify-center p-4 rounded-[8px] mb-6 w-full dark:bg-[#FAFAFA1F] bg-[#A087FF1F] items-center">
          <h1 className="text-xl text-primary font-bold">Success!</h1>
        </div>

        <div className="space-y-6">
          <p className="text-lg mb-2">Your transaction was successfully signed and broadcasted.</p>
          <p className="text-md text-gray-400 mb-6">
            You may now interact with your group by adding members, submitting or voting on
            proposals, and changing group parameters.
          </p>
          <div className="text-md text-gray-400 mb-6 flex-col flex gap-2 ">
            <span>Remember to fund your group by sending tokens to the policy address </span>
            <TruncatedAddressWithCopy address={recentGroup?.policies[0].address} slice={24} />
          </div>

          {/* Group Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Group Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-lg">
                <label className="text-sm text-gray-400">Voting period</label>
                <div>{secondsToHumanReadable(Number(formData.votingPeriod.seconds))}</div>
              </div>
              <div className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-lg">
                <label className="text-sm text-gray-400">Qualified Majority</label>
                <div>
                  {formData.votingThreshold} / {formData.members.length}
                </div>
              </div>
            </div>
          </div>

          {/* Authors */}
          <div className="max-h-28 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Authors</h2>
            <div className="grid grid-cols-3 gap-4">{renderAuthors()}</div>
          </div>

          {/* Members */}
          <div className="max-h-44 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Members</h2>
            <div className="grid grid-cols-3 gap-4">
              {formData.members.map((member, index) => (
                <div key={index} className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-lg">
                  <div className="text-sm text-gray-400">Address</div>
                  <TruncatedAddressWithCopy address={member.address} slice={14} />
                  <div className="text-sm text-gray-400 mt-2">Name</div>
                  <div>{member.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-6 mt-6 mx-auto w-full">
        <Link href="/groups" className="w-[calc(50%-12px)]">
          <button className="btn btn-neutral w-full text-white">Back to Groups Page</button>
        </Link>
        <Link
          href={`/groups?policyAddress=${recentGroup?.policies[0].address}`}
          className="w-[calc(50%-12px)]"
        >
          <button className="btn btn-gradient w-full text-white">View Group</button>
        </Link>
      </div>
    </section>
  );
}
