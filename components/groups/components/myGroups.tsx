import { ExtendedQueryGroupsByMemberResponseSDKType } from '@/hooks/useQueries';
import ProfileAvatar from '@/utils/identicon';
import { truncateString } from '@/utils';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ProposalSDKType,
  ThresholdDecisionPolicySDKType,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
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

  const router = useRouter();

  const filteredGroups = groups.groups.filter(group =>
    (group.ipfsMetadata?.title || 'Untitled Group').toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    // Check if there's a policy address in the URL on component mount
    const { policyAddress } = router.query;
    if (policyAddress && typeof policyAddress === 'string') {
      const group = groups.groups.find(
        g => g.policies && g.policies.length > 0 && g.policies[0]?.address === policyAddress
      );
      if (group) {
        setSelectedGroup({
          policyAddress,
          name: group.ipfsMetadata?.title ?? 'Untitled Group',
          threshold:
            (group.policies[0]?.decision_policy as ThresholdDecisionPolicySDKType)?.threshold ??
            '0',
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

  const handleSelectGroup = (policyAddress: string, groupName: string, threshold: string) => {
    setSelectedGroup({ policyAddress, name: groupName || 'Untitled Group', threshold });
    router.push(`/groups?policyAddress=${policyAddress}`, undefined, { shallow: true });
  };

  const handleBack = () => {
    setSelectedGroup(null);
    router.push('/groups', undefined, { shallow: true });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        className={`absolute inset-0 transition-transform duration-300 ${
          selectedGroup ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
              <h1
                className="text-black dark:text-white"
                style={{ fontSize: '20px', fontWeight: 700, lineHeight: '24px' }}
              >
                My groups
              </h1>
              <div className="relative w-full sm:w-[224px]">
                <input
                  type="text"
                  placeholder="Search for a group..."
                  className="input input-bordered w-full h-[40px] rounded-[12px] border-none bg-[#0000000A] dark:bg-[#FFFFFF1F] pl-10"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <SearchIcon className="h-6 w-6 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="hidden md:block">
              <Link href="/groups/create" passHref>
                <button className="btn btn-gradient w-[224px] h-[52px] text-white rounded-[12px]">
                  Create New Group
                </button>
              </Link>
            </div>
          </div>
          <div className="overflow-auto">
            <div className="max-w-8xl mx-auto">
              <table className="table w-full border-separate border-spacing-y-3">
                <thead className="sticky top-0 bg-[#F0F0FF] dark:bg-[#0E0A1F]">
                  <tr className="text-sm font-medium">
                    <th className="bg-transparent">Group Name</th>
                    <th className="bg-transparent hidden xl:table-cell">Active proposals</th>
                    <th className="bg-transparent hidden xl:table-cell">Authors</th>
                    <th className="bg-transparent hidden sm:table-cell">Group Balance</th>
                    <th className="bg-transparent hidden xl:table-cell">Qualified Majority</th>
                    <th className="bg-transparent hidden lg:table-cell">Group address</th>
                  </tr>
                </thead>
                <tbody className="space-y-4">
                  {isLoading
                    ? Array(10)
                        .fill(0)
                        .map((_, index) => (
                          <tr key={index}>
                            <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] rounded-l-[12px] rounded-r-[12px] sm:rounded-r-none">
                              <div className="flex items-center space-x-3">
                                <div className="skeleton w-10 h-8 rounded-full shrink-0"></div>
                                <div className="skeleton h-3 w-24"></div>
                              </div>
                            </td>
                            <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] hidden xl:table-cell">
                              <div className="skeleton h-2 w-8"></div>
                            </td>
                            <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] hidden xl:table-cell">
                              <div className="skeleton h-2 w-24"></div>
                            </td>
                            <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] hidden sm:table-cell lg:rounded-r-none md:rounded-r-[12px]">
                              <div className="skeleton h-2 w-16"></div>
                            </td>
                            <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] hidden xl:table-cell">
                              <div className="skeleton h-2 w-20"></div>
                            </td>
                            <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] hidden lg:table-cell rounded-r-[12px]">
                              <div className="skeleton h-2 w-32"></div>
                            </td>
                          </tr>
                        ))
                    : filteredGroups.map((group, index) => (
                        <GroupRow
                          key={index}
                          group={group}
                          proposals={
                            group.policies && group.policies.length > 0
                              ? proposals[group.policies[0].address]
                              : []
                          }
                          onSelectGroup={(policyAddress, groupName) =>
                            handleSelectGroup(
                              policyAddress,
                              groupName,
                              (group.policies[0]?.decision_policy as ThresholdDecisionPolicySDKType)
                                ?.threshold ?? '0'
                            )
                          }
                        />
                      ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-6  w-full justify-center md:hidden block">
            <Link href="/groups/create" passHref>
              <button className="btn btn-gradient w-full h-[52px] text-white rounded-[12px]">
                Create New Group
              </button>
            </Link>
          </div>
        </div>
      </div>
      <div
        className={`absolute inset-0 transition-transform duration-300 ${
          selectedGroup ? 'translate-x-0' : 'translate-x-full'
        }`}
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
  group: ExtendedQueryGroupsByMemberResponseSDKType['groups'][0];
  proposals: ProposalSDKType[];
  onSelectGroup: (policyAddress: string, groupName: string, threshold: string) => void;
}) {
  const policyAddress = (group.policies && group.policies[0]?.address) || '';
  const groupName = group.ipfsMetadata?.title || 'Untitled Group';
  const filterActiveProposals = (proposals: ProposalSDKType[]) => {
    return proposals?.filter(
      proposal =>
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
          (group.policies &&
            (group.policies[0]?.decision_policy as ThresholdDecisionPolicySDKType)?.threshold) ??
            '0'
        );
      }}
    >
      <td className="rounded-l-[12px] rounded-r-[12px] sm:rounded-r-none w-1/6">
        <div className="flex items-center space-x-3">
          <ProfileAvatar walletAddress={policyAddress} />
          <span className="font-medium">{truncateString(groupName, 24)}</span>
        </div>
      </td>
      <td className="hidden xl:table-cell w-1/6">
        {activeProposals.length > 0 ? (
          <span className="badge badge-primary badge-sm">{activeProposals.length}</span>
        ) : (
          '-'
        )}
      </td>
      <td className="hidden xl:table-cell w-1/6">
        {truncateString(
          getAuthor(group.ipfsMetadata?.authors) || 'Unknown',
          getAuthor(group.ipfsMetadata?.authors || '').startsWith('manifest1') ? 6 : 24
        )}
      </td>
      <td className="hidden sm:table-cell lg:rounded-r-none md:rounded-r-[12px] w-1/6">
        {Number(shiftDigits(balance?.amount ?? '0', -6)).toLocaleString(undefined, {
          maximumFractionDigits: 6,
        })}{' '}
        MFX
      </td>
      <td className="hidden xl:table-cell w-1/6">
        {`${(group.policies[0]?.decision_policy as ThresholdDecisionPolicySDKType).threshold ?? '0'} / ${group.total_weight ?? '0'}`}
      </td>
      <td className="hidden lg:table-cell rounded-r-[12px] w-1/6">
        <TruncatedAddressWithCopy address={policyAddress} slice={12} />
      </td>
    </tr>
  );
}
