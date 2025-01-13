import { useEffect, useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { QueryGroupsByMemberResponseSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/query';

import { useLcdQueryClient } from './useLcdQueryClient';
import { usePoaLcdQueryClient } from './usePoaLcdQueryClient';
import { getLogoUrls, transformTransactions } from '@/utils';

import { useManifestLcdQueryClient } from './useManifestLcdQueryClient';

import axios from 'axios';
import {
  GroupMemberSDKType,
  GroupPolicyInfoSDKType,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import { Octokit } from 'octokit';

import { useOsmosisRpcQueryClient } from '@/hooks/useOsmosisRpcQueryClient';

export type ExtendedGroupType = QueryGroupsByMemberResponseSDKType['groups'][0] & {
  policies: GroupPolicyInfoSDKType[];
  members: GroupMemberSDKType[];
};

export interface ExtendedQueryGroupsByMemberResponseSDKType {
  groups: ExtendedGroupType[];
}

export interface GitHubRelease {
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
  id: number;
  author: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
  };
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  assets: {
    url: string;
    id: number;
    node_id: string;
    name: string;
    label: string | null;
    uploader: {
      login: string;
      id: number;
      node_id: string;
      avatar_url: string;
      gravatar_id: string;
      url: string;
      html_url: string;
      followers_url: string;
      following_url: string;
      gists_url: string;
      starred_url: string;
      subscriptions_url: string;
      organizations_url: string;
      repos_url: string;
      events_url: string;
      received_events_url: string;
      type: string;
      site_admin: boolean;
    };
    content_type: string;
    state: string;
    size: number;
    download_count: number;
    created_at: string;
    updated_at: string;
    browser_download_url: string;
  }[];
  tarball_url: string;
  zipball_url: string;
  body: string;
}

export const useGroupsByMember = (address: string) => {
  const { lcdQueryClient } = useLcdQueryClient();
  const [extendedGroups, setExtendedGroups] = useState<ExtendedQueryGroupsByMemberResponseSDKType>({
    groups: [],
  });
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const groupQuery = useQuery({
    queryKey: ['groupInfo', address],
    queryFn: () => lcdQueryClient?.cosmos.group.v1.groupsByMember({ address }),
    enabled: !!lcdQueryClient && !!address,
    staleTime: Infinity,
  });

  useEffect(() => {
    const fetchAdditionalData = async () => {
      if (groupQuery.data?.groups && !groupQuery.isLoading) {
        try {
          const policyPromises = groupQuery.data.groups.map(group =>
            lcdQueryClient?.cosmos.group.v1.groupPoliciesByGroup({
              groupId: group.id,
            })
          );
          const memberPromises = groupQuery.data.groups.map(group =>
            lcdQueryClient?.cosmos.group.v1.groupMembers({ groupId: group.id })
          );

          const [policiesResults, membersResults] = await Promise.all([
            Promise.all(policyPromises),
            Promise.all(memberPromises),
          ]);

          const groupsWithAllData = groupQuery.data.groups.map((group, index) => ({
            ...group,

            policies: policiesResults[index]?.group_policies || [],
            members: membersResults[index]?.members || [],
          }));

          setExtendedGroups({ groups: groupsWithAllData });
        } catch (err) {
          console.error('Failed to fetch additional group data:', err);
          setError(err as Error);
        } finally {
          setAllDataLoaded(true);
        }
      }
    };

    fetchAdditionalData();
  }, [groupQuery.data, groupQuery.isLoading, lcdQueryClient?.cosmos.group.v1]);

  return {
    groupByMemberData: extendedGroups,
    isGroupByMemberLoading: !allDataLoaded,
    isGroupByMemberError: error || groupQuery.isError,
    refetchGroupByMember: groupQuery.refetch,
  };
};

export const useGroupsByAdmin = (admin: string) => {
  const { lcdQueryClient } = useLcdQueryClient();
  const [extendedGroups, setExtendedGroups] = useState<ExtendedQueryGroupsByMemberResponseSDKType>({
    groups: [],
  });
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const groupQuery = useQuery({
    queryKey: ['groupInfo', admin],
    queryFn: () => lcdQueryClient?.cosmos.group.v1.groupsByAdmin({ admin }),
    enabled: !!lcdQueryClient && !!admin,
    staleTime: Infinity,
  });

  useEffect(() => {
    const fetchAdditionalData = async () => {
      if (groupQuery.data?.groups && !groupQuery.isLoading) {
        try {
          const policyPromises = groupQuery.data.groups.map(group =>
            lcdQueryClient?.cosmos.group.v1.groupPoliciesByGroup({
              groupId: group.id,
            })
          );
          const memberPromises = groupQuery.data.groups.map(group =>
            lcdQueryClient?.cosmos.group.v1.groupMembers({ groupId: group.id })
          );

          const [policiesResults, membersResults] = await Promise.all([
            Promise.all(policyPromises),
            Promise.all(memberPromises),
          ]);

          const groupsWithAllData = groupQuery.data.groups.map((group, index) => ({
            ...group,
            policies: policiesResults[index]?.group_policies || [],
            members: membersResults[index]?.members || [],
          }));

          setExtendedGroups({ groups: groupsWithAllData });
        } catch (err) {
          console.error('Failed to fetch additional group data:', err);
          setError(err as Error);
        } finally {
          setAllDataLoaded(true);
        }
      }
    };

    fetchAdditionalData();
  }, [groupQuery.data, groupQuery.isLoading, lcdQueryClient?.cosmos.group.v1]);

  return {
    groupByAdmin: extendedGroups,
    isGroupByAdminLoading: !allDataLoaded,
    isGroupByAdminError: error || groupQuery.isError,
    refetchGroupByAdmin: groupQuery.refetch,
  };
};
export const useCurrentPlan = () => {
  const { lcdQueryClient } = useLcdQueryClient();

  const fetchCurrentPlan = async () => {
    if (!lcdQueryClient) {
      throw new Error('LCD Client not ready');
    }
    return await lcdQueryClient.cosmos.upgrade.v1beta1.currentPlan({});
  };

  const currentPlanQuery = useQuery({
    queryKey: ['currentPlan'],
    queryFn: fetchCurrentPlan,
    enabled: !!lcdQueryClient,
    staleTime: Infinity,
  });

  return {
    plan: currentPlanQuery.data?.plan,
    isPlanLoading: currentPlanQuery.isLoading,
    isPlanError: currentPlanQuery.isError,
    refetchPlan: currentPlanQuery.refetch,
  };
};
export const useProposalsByPolicyAccount = (policyAccount: string) => {
  const { lcdQueryClient } = useLcdQueryClient();

  const fetchGroupInfo = async () => {
    if (!lcdQueryClient) {
      throw new Error('LCD Client not ready');
    }
    return await lcdQueryClient.cosmos.group.v1.proposalsByGroupPolicy({
      address: policyAccount,
    });
  };

  const proposalQuery = useQuery({
    queryKey: ['proposalInfo', policyAccount],
    queryFn: fetchGroupInfo,
    enabled: !!lcdQueryClient && !!policyAccount,
    staleTime: Infinity,
  });

  return {
    proposals: proposalQuery.data?.proposals || [],
    isProposalsLoading: proposalQuery.isLoading,
    isProposalsError: proposalQuery.isError,
    refetchProposals: proposalQuery.refetch,
  };
};

export const useProposalsByPolicyAccountAll = (policyAccounts: string[]) => {
  const { lcdQueryClient } = useLcdQueryClient();

  const fetchGroupInfo = async (policyAccount: string) => {
    if (!lcdQueryClient) {
      throw new Error('LCD Client not ready');
    }
    return await lcdQueryClient.cosmos.group.v1.proposalsByGroupPolicy({
      address: policyAccount,
    });
  };

  const proposalQueries = useQueries({
    queries: policyAccounts.map(policyAccount => ({
      queryKey: ['proposalInfo', policyAccount],
      queryFn: () => fetchGroupInfo(policyAccount),
      enabled: !!lcdQueryClient && !!policyAccount,
      staleTime: Infinity,
    })),
  });

  const result: Record<string, any> = {};

  proposalQueries.forEach((proposalQuery, index) => {
    result[policyAccounts[index]] = proposalQuery.data?.proposals || [];
  });

  return {
    proposalsByPolicyAccount: result,
    isProposalsLoading: proposalQueries.some(query => query.isLoading),
    isProposalsError: proposalQueries.some(query => query.isError),
    refetchProposals: () => proposalQueries.forEach(query => query.refetch()),
  };
};

export const useTallyCount = (proposalId: bigint) => {
  const { lcdQueryClient } = useLcdQueryClient();

  const fetchGroupInfo = async () => {
    if (!lcdQueryClient) {
      throw new Error('LCD Client not ready');
    }
    return await lcdQueryClient.cosmos.group.v1.tallyResult({
      proposalId: proposalId,
    });
  };

  const tallyQuery = useQuery({
    queryKey: ['tallyInfo', proposalId.toString()],
    queryFn: fetchGroupInfo,
    enabled: !!lcdQueryClient && !!proposalId,
    staleTime: Infinity,
  });

  return {
    tally: tallyQuery.data,
    isTallyLoading: tallyQuery.isLoading,
    isTallyError: tallyQuery.isError,
    refetchTally: tallyQuery.refetch,
  };
};

export const useVotesByProposal = (proposalId: bigint) => {
  const { lcdQueryClient } = useLcdQueryClient();

  const fetchGroupInfo = async () => {
    if (!lcdQueryClient) {
      throw new Error('LCD Client not ready');
    }
    return await lcdQueryClient.cosmos.group.v1.votesByProposal({
      proposalId: proposalId,
    });
  };

  const voteQuery = useQuery({
    queryKey: ['voteInfo', proposalId.toString()],
    queryFn: fetchGroupInfo,
    enabled: !!lcdQueryClient && !!proposalId,
    staleTime: Infinity,
  });

  return {
    votes: voteQuery.data?.votes || [],
    isVotesLoading: voteQuery.isLoading,
    isVotesError: voteQuery.isError,
    refetchVotes: voteQuery.refetch,
  };
};

export const useBalance = (address: string) => {
  const { lcdQueryClient } = useLcdQueryClient();

  const fetchBalance = async () => {
    if (!lcdQueryClient) {
      throw new Error('LCD Client not ready');
    }
    return await lcdQueryClient.cosmos.bank.v1beta1.balance({
      denom: 'umfx',
      address,
    });
  };

  const balanceQuery = useQuery({
    queryKey: ['balanceInfo', address],
    queryFn: fetchBalance,
    enabled: !!lcdQueryClient && !!address,
    staleTime: Infinity,
  });

  return {
    balance: balanceQuery.data?.balance,
    isBalanceLoading: balanceQuery.isLoading,
    isBalanceError: balanceQuery.isError,
    refetchBalance: balanceQuery.refetch,
  };
};

export const useTotalSupply = () => {
  const { lcdQueryClient } = useLcdQueryClient();

  const fetchBalances = async () => {
    if (!lcdQueryClient) {
      throw new Error('LCD Client not ready');
    }
    return await lcdQueryClient.cosmos.bank.v1beta1.totalSupply({});
  };

  const totalSupplyQuery = useQuery({
    queryKey: ['totalSupply'],
    queryFn: fetchBalances,
    enabled: !!lcdQueryClient,
    staleTime: Infinity,
  });
  return {
    totalSupply: totalSupplyQuery.data?.supply,
    isTotalSupplyLoading: totalSupplyQuery.isLoading,
    isTotalSupplyError: totalSupplyQuery.isError,
    refetchTotalSupply: totalSupplyQuery.refetch,
  };
};

export const useTokenFactoryBalance = (address: string, denom: string) => {
  const { lcdQueryClient } = useLcdQueryClient();

  const fetchBalance = async () => {
    if (!lcdQueryClient || !address || !denom) {
      throw new Error('LCD Client not ready');
    }
    return await lcdQueryClient.cosmos.bank.v1beta1.balance({ denom, address });
  };

  const balanceQuery = useQuery({
    queryKey: ['factoryBalance', address],
    queryFn: fetchBalance,
    enabled: !!lcdQueryClient && !!address && !!denom,
    staleTime: Infinity,
  });

  return {
    balance: balanceQuery.data?.balance,
    isBalanceLoading: balanceQuery.isLoading,
    isBalanceError: balanceQuery.isError,
    refetchBalance: balanceQuery.refetch,
  };
};

export const usePoaGetAdmin = () => {
  const { lcdQueryClient } = usePoaLcdQueryClient();

  const fetchPoaAdmin = async () => {
    if (!lcdQueryClient) {
      throw new Error('LCD Client not ready');
    }
    return await lcdQueryClient.strangelove_ventures.poa.v1.poaAuthority({});
  };

  const paramsQuery = useQuery({
    queryKey: ['paramsInfo', lcdQueryClient],
    queryFn: fetchPoaAdmin,
    enabled: !!lcdQueryClient,
    staleTime: Infinity,
    refetchOnMount: true,
  });

  return {
    poaAdmin: paramsQuery.data?.authority,
    isPoaAdminLoading: paramsQuery.isLoading,
    isPoaAdminError: paramsQuery.isError,
    refetchPoaAdmin: paramsQuery.refetch,
  };
};

export const usePendingValidators = () => {
  const { lcdQueryClient } = usePoaLcdQueryClient();

  const fetchParams = async () => {
    if (!lcdQueryClient) {
      throw new Error('LCD Client not ready');
    }
    return await lcdQueryClient.strangelove_ventures.poa.v1.pendingValidators({});
  };

  const paramsQuery = useQuery({
    queryKey: ['pendingVals'],
    queryFn: fetchParams,
    enabled: !!lcdQueryClient,
    staleTime: Infinity,
  });

  return {
    pendingValidators: paramsQuery.data?.pending,
    isPendingValidatorsLoading: paramsQuery.isLoading,
    isPendingValidatorsError: paramsQuery.isError,
    refetchPendingValidators: paramsQuery.refetch,
  };
};
export const useValidators = () => {
  const { lcdQueryClient } = useLcdQueryClient();
  const { lcdQueryClient: poaLcdQueryCLient } = usePoaLcdQueryClient();
  const fetchConsensusPower = async (validators: any[]) => {
    if (!lcdQueryClient || !poaLcdQueryCLient) {
      throw new Error('LCD Client not ready');
    }

    const promises = validators.map(async validator => {
      const consensusPowerResponse =
        await poaLcdQueryCLient.strangelove_ventures.poa.v1.consensusPower({
          validatorAddress: validator.operator_address,
        });
      const logoUrlResponse = await getLogoUrls(validator);
      return {
        ...validator,
        consensus_power: consensusPowerResponse.consensus_power,
        logo_url: logoUrlResponse,
      };
    });

    return await Promise.all(promises);
  };

  const fetchParams = async () => {
    if (!lcdQueryClient) {
      throw new Error('LCD Client not ready');
    }
    const validatorsResponse = await lcdQueryClient.cosmos.staking.v1beta1.validators({
      status: 'BOND_STATUS_BONDED',
    });
    const validatorsWithConsensusPower = await fetchConsensusPower(validatorsResponse.validators);
    return validatorsWithConsensusPower;
  };

  const paramsQuery = useQuery({
    queryKey: ['validators'],
    queryFn: fetchParams,
    enabled: !!lcdQueryClient,
    staleTime: Infinity,
  });

  return {
    validators: paramsQuery.data,
    isActiveValidatorsLoading: paramsQuery.isLoading,
    isActiveValidatorsError: paramsQuery.isError,
    refetchActiveValidatorss: paramsQuery.refetch,
  };
};

export const useTokenFactoryDenomsFromAdmin = (address: string) => {
  const { lcdQueryClient } = useManifestLcdQueryClient();

  const fetchDenoms = async () => {
    if (!lcdQueryClient) {
      throw new Error('LCD Client not ready');
    }
    if (!lcdQueryClient.osmosis) {
      throw new Error('Osmosis module not found in LCD client');
    }

    if (!address) {
      return { denoms: [] };
    }
    return await lcdQueryClient.osmosis.tokenfactory.v1beta1.denomsFromAdmin({
      admin: address,
    });
  };

  const denomsQuery = useQuery({
    queryKey: [address + 'denoms'],
    queryFn: fetchDenoms,
    enabled: !!lcdQueryClient && !!address,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return {
    denoms: denomsQuery.data,
    isDenomsLoading: denomsQuery.isLoading,
    isDenomsError: denomsQuery.isError,
    denomError: denomsQuery.error,
    refetchDenoms: denomsQuery.refetch,
  };
};

// We can't use the REST client here because the subdenom is not supported by the REST API
export const useDenomAuthorityMetadata = (denom: string) => {
  const { rpcQueryClient } = useOsmosisRpcQueryClient();

  const fetchAuthority = async () => {
    if (!rpcQueryClient) {
      throw new Error('RPC Client not ready');
    }
    if (!denom) {
      throw new Error('Denom not provided');
    }
    return await rpcQueryClient.osmosis.tokenfactory.v1beta1.denomAuthorityMetadata({
      denom: denom,
    });
  };

  const denomsQuery = useQuery({
    queryKey: ['authority', denom],
    queryFn: fetchAuthority,
    enabled: !!rpcQueryClient && !!denom,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  return {
    denomAuthority: denomsQuery.data?.authorityMetadata,
    isDenomAuthorityLoading: denomsQuery.isLoading,
    isDenomAuthorityError: denomsQuery.isError,
    refetchDenomAuthority: denomsQuery.refetch,
  };
};

export const useTokenFactoryDenomsMetadata = () => {
  const { lcdQueryClient } = useLcdQueryClient();

  const fetchDenoms = async () => {
    if (!lcdQueryClient) {
      throw new Error('LCD Client not ready');
    }

    return await lcdQueryClient.cosmos.bank.v1beta1.denomsMetadata({});
  };

  const denomsQuery = useQuery({
    queryKey: ['allMetadatas'],
    queryFn: fetchDenoms,
    enabled: !!lcdQueryClient,
    staleTime: Infinity,
  });

  return {
    metadatas: denomsQuery.data,
    isMetadatasLoading: denomsQuery.isLoading,
    isMetadatasError: denomsQuery.isError,
    refetchMetadatas: denomsQuery.refetch,
  };
};

export const useTokenBalances = (address: string) => {
  const { lcdQueryClient } = useLcdQueryClient();

  const fetchBalances = async () => {
    if (!lcdQueryClient) {
      throw new Error('LCD Client not ready');
    }
    return await lcdQueryClient.cosmos.bank.v1beta1.allBalances({
      address,
      resolveDenom: false,
    });
  };

  const balancesQuery = useQuery({
    queryKey: ['balances', address],
    queryFn: fetchBalances,
    enabled: !!lcdQueryClient && !!address,
    staleTime: Infinity,
  });

  return {
    balances: balancesQuery.data?.balances,
    isBalancesLoading: balancesQuery.isLoading,
    isBalancesError: balancesQuery.isError,
    refetchBalances: balancesQuery.refetch,
  };
};

export const useTokenBalancesResolved = (address: string) => {
  const { lcdQueryClient } = useLcdQueryClient();

  const fetchBalances = async () => {
    if (!lcdQueryClient) {
      throw new Error('LCD Client not ready');
    }
    return await lcdQueryClient.cosmos.bank.v1beta1.allBalances({
      address,
      resolveDenom: true,
    });
  };

  const balancesQuery = useQuery({
    queryKey: ['balances-resolved', address],
    queryFn: fetchBalances,
    enabled: !!lcdQueryClient && !!address,
    staleTime: Infinity,
  });

  return {
    balances: balancesQuery.data?.balances,
    isBalancesLoading: balancesQuery.isLoading,
    isBalancesError: balancesQuery.isError,
    refetchBalances: balancesQuery.refetch,
  };
};

// Helper function to transform API response to match the component's expected format
export const useGetFilteredTxAndSuccessfulProposals = (
  indexerUrl: string,
  address: string,
  page: number = 1,
  pageSize: number = 10
) => {
  const fetchTransactions = async () => {
    const baseUrl = `${indexerUrl}/rpc/get_address_filtered_transactions_and_successful_proposals?address=${address}`;

    // Update order parameter to sort by timestamp instead of height
    const offset = (page - 1) * pageSize;
    const paginationParams = `&limit=${pageSize}&offset=${offset}`;
    const orderParam = `&order=data->txResponse->timestamp.desc`; // Changed from height to timestamp

    const finalUrl = `${baseUrl}${orderParam}${paginationParams}`;

    try {
      // First, get the total count
      const countResponse = await axios.get(baseUrl, {
        headers: {
          Prefer: 'count=exact',
          'Range-Unit': 'items',
          Range: '0-0', // We only need the count, not the actual data
        },
      });

      // Get the total count from the content-range header
      const contentRange = countResponse.headers['content-range'];
      const totalCount = contentRange ? parseInt(contentRange.split('/')[1]) : 0;

      // Then get the paginated data
      const dataResponse = await axios.get(finalUrl, {
        headers: {
          'Range-Unit': 'items',
          Range: `${offset}-${offset + pageSize - 1}`,
        },
      });

      const transactions = dataResponse.data
        .flatMap((tx: any) => transformTransactions(tx, address))
        .filter((tx: any) => tx !== null)
        // Add secondary JS sort
        .sort((a: any, b: any) => {
          // Sort by timestamp descending (newest first)
          const dateComparison =
            new Date(b.formatted_date).getTime() - new Date(a.formatted_date).getTime();
          if (dateComparison !== 0) return dateComparison;
          // If timestamps are equal, sort by block number descending
          return b.block_number - a.block_number;
        });

      return {
        transactions,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  };

  const sendQuery = useQuery({
    queryKey: ['getFilteredTxsAndSuccessfulProposals', address, page, pageSize],
    queryFn: fetchTransactions,
    enabled: !!address,
  });

  return {
    sendTxs: sendQuery.data?.transactions,
    totalCount: sendQuery.data?.totalCount,
    totalPages: sendQuery.data?.totalPages || 1,
    isLoading: sendQuery.isLoading,
    isError: sendQuery.isError,
    error: sendQuery.error,
    refetch: sendQuery.refetch,
  };
};
export const useMultipleTallyCounts = (proposalIds: bigint[]) => {
  const { lcdQueryClient } = useLcdQueryClient();

  const tallyQueries = useQueries({
    queries: proposalIds.map(proposalId => ({
      queryKey: ['tallyInfo', proposalId.toString()],
      queryFn: async () => {
        if (!lcdQueryClient) {
          throw new Error('LCD Client not ready');
        }
        return await lcdQueryClient.cosmos.group.v1.tallyResult({
          proposalId: proposalId,
        });
      },
      enabled: !!lcdQueryClient && !!proposalId,
      staleTime: Infinity,
    })),
  });

  return {
    tallies: tallyQueries.map((query, index) => ({
      proposalId: proposalIds[index],
      tally: query.data,
    })),
    isLoading: tallyQueries.some(query => query.isLoading),
    isError: tallyQueries.some(query => query.isError),
    refetchTallies: () => tallyQueries.forEach(query => query.refetch()),
  };
};

export const useGitHubReleases = () => {
  const octokit = new Octokit({});

  const fetchReleases = async () => {
    try {
      const response = await octokit.rest.repos.listReleases({
        owner: 'liftedinit',
        repo: 'manifest-ledger',
      });
      return response.data as GitHubRelease[];
    } catch (error) {
      console.error('Error fetching GitHub releases:', error);
      throw error;
    }
  };

  const releasesQuery = useQuery({
    queryKey: ['githubReleases'],
    queryFn: fetchReleases,
  });

  return {
    releases: releasesQuery.data || [],
    isReleasesLoading: releasesQuery.isLoading,
    isReleasesError: releasesQuery.isError,
    refetchReleases: releasesQuery.refetch,
  };
};

export const useBlockHeight = () => {
  const { lcdQueryClient } = useLcdQueryClient();

  const fetchBlockHeight = async () => {
    const response = await lcdQueryClient?.cosmos.base.node.v1beta1.status();
    return response?.height;
  };

  const blockHeightQuery = useQuery({
    queryKey: ['blockHeight'],
    queryFn: fetchBlockHeight,
    enabled: !!lcdQueryClient,
    staleTime: 0,
    refetchInterval: 6000,
  });

  return {
    blockHeight: blockHeightQuery.data,
    isBlockHeightLoading: blockHeightQuery.isLoading,
    isBlockHeightError: blockHeightQuery.isError,
    refetchBlockHeight: blockHeightQuery.refetch,
  };
};
