import { ExtendedQueryGroupsByMemberResponseSDKType } from '@/hooks/useQueries';
import ProfileAvatar from '@/utils/identicon';
import { truncateString } from '@/utils';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ProposalSDKType } from '@chalabi/manifestjs/dist/codegen/cosmos/group/v1/types';
import GroupProposals from './groupProposals';
import { useBalance } from '@/hooks/useQueries';
import { shiftDigits } from '@/utils';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { SearchIcon } from '@/components/icons';

export function YourGroups({
  groups,
  proposals,
  isLoading,
}: {
  groups: ExtendedQueryGroupsByMemberResponseSDKType;
  proposals: { [policyAddress: string]: ProposalSDKType[] };
  isLoading: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<{
    policyAddress: string;
    name: string;
    threshold: string;
  } | null>(null);
  const [showContent, setShowContent] = useState(false);
  const router = useRouter();

  const filteredGroups = groups.groups.filter(group =>
    (group.ipfsMetadata?.title || 'Untitled Group').toLowerCase().includes(searchTerm.toLowerCase())
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
          threshold: group.policies[0]?.decision_policy?.threshold ?? '0',
        });
      }
    }
  }, [router.query, groups.groups]);

  useEffect(() => {
    // Scroll to top when a group is selected
    if (selectedGroup) {
      window.scrollTo(0, 0);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 900); // 900ms buffer
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handleSelectGroup = (policyAddress: string, groupName: string, threshold: string) => {
    setSelectedGroup({ policyAddress, name: groupName || 'Untitled Group', threshold });
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
              <h1
                className="text-black dark:text-white"
                style={{ fontSize: '20px', fontWeight: 700, lineHeight: '24px' }}
              >
                My groups
              </h1>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for a group..."
                  className="input input-bordered w-[224px] h-[40px] rounded-[12px] border-none bg:[#0000000A] dark:bg-[#FFFFFF1F] pl-10"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <SearchIcon className="h-6 w-6 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 " />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/groups/create" passHref>
                <button className="btn btn-gradient w-[224px] h-[52px] text-white rounded-[12px]">
                  Create New Group
                </button>
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[87vh] w-full">
            <div className="max-w-8xl mx-auto">
              {' '}
              {/* table */}
              <table className="table w-full border-separate border-spacing-y-3">
                <thead className="sticky top-0 bg-[#F0F0FF] dark:bg-[#0E0A1F]">
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
                  {isLoading || !showContent
                    ? // Skeleton
                      Array(12)
                        .fill(0)
                        .map((_, index) => (
                          <tr key={index}>
                            <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] rounded-l-[12px] w-1/6">
                              <div className="flex items-center space-x-3">
                                <div className="skeleton w-10 h-8 rounded-full shrink-0"></div>
                                <div className="skeleton h-3 w-24"></div>
                              </div>
                            </td>
                            <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] w-1/6">
                              <div className="skeleton h-2 w-8"></div>
                            </td>
                            <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] w-1/6">
                              <div className="skeleton h-2 w-24"></div>
                            </td>
                            <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] w-1/6">
                              <div className="skeleton h-2 w-16"></div>
                            </td>
                            <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] w-1/6">
                              <div className="skeleton h-2 w-20"></div>
                            </td>
                            <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] rounded-r-[12px] w-1/6">
                              <div className="skeleton h-2 w-32"></div>
                            </td>
                          </tr>
                        ))
                    : // content
                      filteredGroups.map((group, index) => (
                        <GroupRow
                          key={index}
                          group={group}
                          proposals={proposals[group.policies[0].address]}
                          onSelectGroup={(policyAddress, groupName) =>
                            handleSelectGroup(
                              policyAddress,
                              groupName,
                              group.policies[0]?.decision_policy?.threshold ?? '0'
                            )
                          }
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
            policyThreshold={selectedGroup}
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
  onSelectGroup: (policyAddress: string, groupName: string, threshold: string) => void;
}) {
  const policyAddress = group.policies[0]?.address || '';
  const groupName = group.ipfsMetadata?.title || 'Untitled Group';
  const filterActiveProposals = (proposals: ProposalSDKType[]) => {
    return proposals?.filter(
      proposal =>
        proposal.status.toString() !== 'PROPOSAL_STATUS_ACCEPTED' &&
        proposal.status.toString() !== 'PROPOSAL_STATUS_REJECTED' &&
        proposal.status.toString() !== 'PROPOSAL_STATUS_WITHDRAWN'
    );
  };
  const activeProposals = filterActiveProposals(proposals);

  const { balance } = useBalance(policyAddress);

  const getAuthor = (authors: string | string[] | undefined): string => {
    if (Array.isArray(authors)) {
      return authors[0] || 'Unknown';
    }
    return authors || 'Unknown';
  };

  return (
    <tr
      className="hover:bg-[#FFFFFF66] dark:hover:bg-[#FFFFFF1A] dark:bg-[#FFFFFF0F] bg-[#FFFFFF] text-black dark:text-white rounded-lg cursor-pointer"
      onClick={e => {
        e.stopPropagation();
        onSelectGroup(
          policyAddress,
          groupName,
          group.policies[0]?.decision_policy?.threshold ?? '0'
        );
      }}
    >
      <td className=" rounded-l-[12px] w-1/6">
        <div className="flex items-center space-x-3">
          <ProfileAvatar walletAddress={policyAddress} />
          <span className="font-medium">{truncateString(groupName, 24)}</span>
        </div>
      </td>
      <td className=" w-1/6">
        {activeProposals.length > 0 ? (
          <span className="badge badge-primary badge-sm">{activeProposals.length}</span>
        ) : (
          '-'
        )}
      </td>
      <td className=" w-1/6">
        {truncateString(
          getAuthor(group.ipfsMetadata?.authors) || 'Unknown',
          getAuthor(group.ipfsMetadata?.authors || '').startsWith('manifest1') ? 6 : 24
        )}
      </td>
      <td className=" w-1/6">
        {Number(shiftDigits(balance?.amount ?? '0', -6)).toLocaleString(undefined, {
          maximumFractionDigits: 6,
        })}{' '}
        MFX
      </td>
      <td className=" w-1/6">{`${group.policies[0]?.decision_policy?.threshold ?? '0'} / ${group.total_weight ?? '0'}`}</td>
      <td className="rounded-r-[12px] w-1/6">
        <TruncatedAddressWithCopy address={policyAddress} slice={12} />
      </td>
    </tr>
  );
}
