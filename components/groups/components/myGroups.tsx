import { ExtendedQueryGroupsByMemberResponseSDKType } from '@/hooks/useQueries';
import ProfileAvatar from '@/utils/identicon';
import { truncateString } from '@/utils';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ProposalSDKType } from '@chalabi/manifestjs/dist/codegen/cosmos/group/v1/types';
import GroupProposals from './groupProposals';

export function YourGroups({
  groups,
  proposals,
}: {
  groups: ExtendedQueryGroupsByMemberResponseSDKType;
  proposals: { [policyAddress: string]: ProposalSDKType[] };
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<{
    policyAddress: string;
    name: string;
  } | null>(null);
  const router = useRouter();

  const filteredGroups = groups.groups.filter(group =>
    group.ipfsMetadata?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    // Check if there's a policy address in the URL on component mount
    const { policyAddress } = router.query;
    if (policyAddress && typeof policyAddress === 'string') {
      const group = groups.groups.find(g => g.policies[0]?.address === policyAddress);
      if (group) {
        setSelectedGroup({
          policyAddress,
          name: group.ipfsMetadata?.title ?? 'Untitled Group',
        });
      }
    }
  }, [router.query, groups.groups]);

  const handleSelectGroup = (policyAddress: string, groupName: string) => {
    setSelectedGroup({ policyAddress, name: groupName });
    router.push(`/groups?policyAddress=${policyAddress}`, undefined, { shallow: true });
  };

  const handleBack = () => {
    setSelectedGroup(null);
    router.push('/groups', undefined, { shallow: true });
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className={`transition-transform duration-300 ${selectedGroup ? '-translate-x-full' : 'translate-x-0'}`}
      >
        <div className="space-y-4 w-full pt-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <h1 style={{ fontSize: '20px', fontWeight: 700, lineHeight: '24px' }}>My groups</h1>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for a group..."
                  className="input input-bordered w-[224px] h-[40px] rounded-[12px] border-none bg-[#FFFFFF1F] pl-10"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/groups/create" passHref>
                <button className="btn btn-gradient w-[224px] h-[52px] rounded-[12px]">
                  Create New Group
                </button>
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto w-full">
            <div className="max-w-8xl mx-auto">
              {' '}
              {/* Center the table */}
              <table className="table w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-sm font-medium">
                    <th className="bg-transparent w-1/6">Group Name</th>
                    <th className="bg-transparent w-1/6">Active proposals</th>
                    <th className="bg-transparent w-1/6">Authors</th>
                    <th className="bg-transparent w-1/6">Group Balance</th>
                    <th className="bg-transparent w-1/6">Qualified Majority</th>
                    <th className="bg-transparent w-1/6">Group address</th>
                  </tr>
                </thead>
                <tbody className="space-y-4">
                  {filteredGroups.map((group, index) => (
                    <GroupRow
                      key={index}
                      group={group}
                      proposals={proposals[group.policies[0].address]}
                      onSelectGroup={handleSelectGroup}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`absolute top-0 left-0 w-full h-full transition-transform duration-300 ${selectedGroup ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {selectedGroup && (
          <GroupProposals
            policyAddress={selectedGroup.policyAddress}
            groupName={selectedGroup.name}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}

function GroupRow({
  group,
  proposals,
  onSelectGroup,
}: {
  group: any;
  proposals: ProposalSDKType[];
  onSelectGroup: (policyAddress: string, groupName: string) => void;
}) {
  const policyAddress = group.policies[0]?.address;
  const groupName = group.ipfsMetadata?.title ?? 'Untitled Group';
  const filterActiveProposals = (proposals: ProposalSDKType[]) => {
    return proposals?.filter(
      proposal =>
        proposal.status.toString() !== 'PROPOSAL_STATUS_ACCEPTED' &&
        proposal.status.toString() !== 'PROPOSAL_STATUS_REJECTED' &&
        proposal.status.toString() !== 'PROPOSAL_STATUS_WITHDRAWN'
    );
  };
  const activeProposals = filterActiveProposals(proposals);

  return (
    <tr
      className="hover:bg-base-200 rounded-lg cursor-pointer"
      onClick={e => {
        e.stopPropagation();
        onSelectGroup(policyAddress, groupName);
      }}
    >
      <td className="dark:bg-[#FFFFFF0F] rounded-l-[12px] w-1/6">
        <div className="flex items-center space-x-3">
          <ProfileAvatar walletAddress={group.created_at.toString() ?? ''} />
          <span className="font-medium">{truncateString(groupName, 24)}</span>
        </div>
      </td>
      <td className="dark:bg-[#FFFFFF0F] w-1/6">
        {activeProposals.length > 0 ? (
          <span className="badge badge-primary badge-sm">{activeProposals.length}</span>
        ) : (
          '-'
        )}
      </td>
      <td className="dark:bg-[#FFFFFF0F] w-1/6">
        {truncateString(
          group.ipfsMetadata?.authors ?? 'Unknown',
          group.ipfsMetadata?.authors?.startsWith('manifest1') ? 6 : 24
        )}
      </td>
      <td className="dark:bg-[#FFFFFF0F] w-1/6">{group.balance ?? '0'} MFX</td>
      <td className="dark:bg-[#FFFFFF0F] w-1/6">{`${group.policies[0]?.decision_policy?.threshold ?? '0'} / ${group.total_weight ?? '0'}`}</td>
      <td className="dark:bg-[#FFFFFF0F] rounded-r-[12px] w-1/6">
        {truncateString(policyAddress, 6)}
      </td>
    </tr>
  );
}
