import { useEffect, useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { QueryGroupsByMemberResponseSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/query';

import { useLcdQueryClient } from './useLcdQueryClient';
import { usePoaLcdQueryClient } from './usePoaLcdQueryClient';
import { getLogoUrls, isValidIPFSCID } from '@/utils';

import { useManifestLcdQueryClient } from './useManifestLcdQueryClient';

import axios from 'axios';
import {
  GroupMemberSDKType,
  GroupPolicyInfoSDKType,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
export interface IPFSMetadata {
  title: string;
  authors: string | string[];
  summary: string;
  details: string;
  proposalForumURL: string;
  voteOptionContext: string;
}

export type ExtendedGroupType = QueryGroupsByMemberResponseSDKType['groups'][0] & {
  ipfsMetadata: IPFSMetadata | null;
  policies: GroupPolicyInfoSDKType[];
  members: GroupMemberSDKType[];
};

export interface ExtendedQueryGroupsByMemberResponseSDKType {
  groups: ExtendedGroupType[];
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
          const ipfsPromises = groupQuery.data.groups.map(group => {
            if (isValidIPFSCID(group.metadata)) {
              return fetch(`https://nodes.chandrastation.com/ipfs/gateway/${group.metadata}`)
                .then(response => {
                  if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                  }
                  return response.json() as Promise<IPFSMetadata>;
                })
                .catch(err => {
                  console.error(`Invalid IPFS CID for group #${group?.id}`, err);
                  return null;
                });
            } else {
              console.warn(`Invalid IPFS CID for group #${group?.id}`);
              return Promise.resolve(null);
            }
          });

          const [policiesResults, membersResults, ipfsResults] = await Promise.all([
            Promise.all(policyPromises),
            Promise.all(memberPromises),
            Promise.all(ipfsPromises),
          ]);

          const groupsWithAllData = groupQuery.data.groups.map((group, index) => ({
            ...group,
            ipfsMetadata: ipfsResults[index],
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
          const ipfsPromises = groupQuery.data.groups.map(group =>
            fetch(`https://nodes.chandrastation.com/ipfs/gateway/${group.metadata}`)
              .then(response => {
                if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json() as Promise<IPFSMetadata>;
              })
              .catch(err => {
                console.warn(`Failed to fetch IPFS metadata for group #${group.id}:`, err);
                return null;
              })
          );

          const [policiesResults, membersResults, ipfsResults] = await Promise.all([
            Promise.all(policyPromises),
            Promise.all(memberPromises),
            Promise.all(ipfsPromises),
          ]);

          const groupsWithAllData = groupQuery.data.groups.map((group, index) => ({
            ...group,
            ipfsMetadata: ipfsResults[index] || null,
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

export const usePoliciesById = (groupId: bigint) => {
  const { lcdQueryClient } = useLcdQueryClient();

  const fetchGroupInfo = async () => {
    if (!lcdQueryClient) {
      throw new Error('LCD Client not ready');
    }
    return await lcdQueryClient.cosmos.group.v1.groupPoliciesByGroup({
      groupId: groupId,
    });
  };

  const policyQuery = useQuery({
    queryKey: ['policyInfo', groupId],
    queryFn: fetchGroupInfo,
    enabled: !!lcdQueryClient && !!groupId,
    staleTime: Infinity,
  });

  return {
    policy: policyQuery.data?.group_policies || [],
    isPolicyLoading: policyQuery.isLoading,
    isPolicyError: policyQuery.isError,
    refetchPolicy: policyQuery.refetch,
  };
};

export const useMembersById = (groupId: bigint) => {
  const { lcdQueryClient } = useLcdQueryClient();

  const fetchGroupInfo = async () => {
    if (!lcdQueryClient) {
      throw new Error('LCD Client not ready');
    }
    return await lcdQueryClient.cosmos.group.v1.groupMembers({
      groupId: groupId,
    });
  };

  const memberQuery = useQuery({
    queryKey: ['memberInfo', groupId],
    queryFn: fetchGroupInfo,
    enabled: !!lcdQueryClient && !!groupId,
    staleTime: Infinity,
  });

  return {
    members: memberQuery.data?.members || [],
    isMembersLoading: memberQuery.isLoading,
    isMembersError: memberQuery.isError,
    refetchMembers: memberQuery.refetch,
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

export const useConsensusPower = (address: string) => {
  const { lcdQueryClient } = usePoaLcdQueryClient();

  const fetchParams = async () => {
    if (!lcdQueryClient) {
      throw new Error('LCD Client not ready');
    }
    return await lcdQueryClient.strangelove_ventures.poa.v1.consensusPower({
      validatorAddress: address,
    });
  };

  const paramsQuery = useQuery({
    queryKey: ['consensusPower', address],
    queryFn: fetchParams,
    enabled: !!lcdQueryClient && !!address,
    staleTime: Infinity,
  });

  return {
    consensusPower: paramsQuery.data?.consensus_power,
    isConsensusLoading: paramsQuery.isLoading,
    isConsensusError: paramsQuery.isError,
    refetchConsensusPower: paramsQuery.refetch,
  };
};

export const useStakingParams = () => {
  const { lcdQueryClient } = useLcdQueryClient();

  const fetchParams = async () => {
    if (!lcdQueryClient) {
      throw new Error('LCD Client not ready');
    }
    return await lcdQueryClient.cosmos.staking.v1beta1.params({});
  };

  const paramsQuery = useQuery({
    queryKey: ['stakingParams'],
    queryFn: fetchParams,
    enabled: !!lcdQueryClient,
    staleTime: Infinity,
  });

  return {
    stakingParams: paramsQuery.data?.params,
    isParamsLoading: paramsQuery.isLoading,
    isParamsError: paramsQuery.isError,
    refetchParams: paramsQuery.refetch,
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

export const useTokenFactoryDenoms = (address: string) => {
  const { lcdQueryClient } = useManifestLcdQueryClient();

  const fetchDenoms = async () => {
    if (!lcdQueryClient) {
      throw new Error('LCD Client not ready');
    }
    if (!address) {
      return { denoms: [] };
    }
    return await lcdQueryClient.osmosis.tokenfactory.v1beta1.denomsFromCreator({
      creator: address,
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
    refetchDenoms: denomsQuery.refetch,
  };
};

export const useTokenFactoryDenomMetadata = (denom: string) => {
  const { lcdQueryClient } = useLcdQueryClient();

  const fetchDenoms = async () => {
    if (!lcdQueryClient) {
      throw new Error('LCD Client not ready');
    }
    if (!denom) {
      throw new Error('Creator address not provided');
    }
    return await lcdQueryClient.cosmos.bank.v1beta1.denomMetadataByQueryString({
      denom: denom,
    });
  };

  const denomsQuery = useQuery({
    queryKey: ['metadata', denom],
    queryFn: fetchDenoms,
    enabled: !!lcdQueryClient && !!denom,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  return {
    metadata: denomsQuery.data,
    isMetadataLoading: denomsQuery.isLoading,
    isMetadataError: denomsQuery.isError,
    refetchMetadata: denomsQuery.refetch,
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

interface TransactionAmount {
  amount: string;
  denom: string;
}

interface TransactionMessage {
  '@type': string;
  amount: TransactionAmount[];
  toAddress: string;
  fromAddress: string;
}

interface TransactionResponse {
  height: string;
  txhash: string;
  timestamp: string;
}

// Helper function to transform API response to match the component's expected format
const transformTransaction = (tx: any) => {
  // Handle both direct MsgSend and nested group proposal MsgSend
  let message: TransactionMessage;
  if (tx.data.tx.body.messages[0]['@type'] === '/cosmos.bank.v1beta1.MsgSend') {
    message = tx.data.tx.body.messages[0];
  } else if (
    tx.data.tx.body.messages[0]['@type'] === '/cosmos.group.v1.MsgSubmitProposal' &&
    tx.data.tx.body.messages[0].messages?.[0]?.['@type'] === '/cosmos.bank.v1beta1.MsgSend'
  ) {
    message = tx.data.tx.body.messages[0].messages[0];
  } else {
    return null;
  }

  return {
    tx_hash: tx.id,
    block_number: parseInt(tx.data.txResponse.height),
    formatted_date: tx.data.txResponse.timestamp,
    data: {
      from_address: message.fromAddress,
      to_address: message.toAddress,
      amount: message.amount.map((amt: TransactionAmount) => ({
        amount: amt.amount,
        denom: amt.denom,
      })),
    },
  };
};

export const useSendTxIncludingAddressQuery = (
  address: string,
  direction?: 'send' | 'receive',
  page: number = 1,
  pageSize: number = 10
) => {
  const fetchTransactions = async () => {
    const baseUrl = 'https://testnet-indexer.liftedinit.tech/transactions';

    const query = `
      and=(
        or(
            data->tx->body->messages.cs.[{"@type": "/cosmos.bank.v1beta1.MsgSend"}],
            data->tx->body->messages.cs.[{"messages": [{"@type": "/cosmos.bank.v1beta1.MsgSend"}]}]
        ),
        or(
            data->tx->body->messages.cs.[{"fromAddress": "${address}"}],
            data->tx->body->messages.cs.[{"toAddress": "${address}"}],
            data->tx->body->messages.cs.[{"messages": [{"fromAddress": "${address}"}]}],
            data->tx->body->messages.cs.[{"messages": [{"toAddress": "${address}"}]}]
        )
      )`;

    // Add pagination parameters
    const offset = (page - 1) * pageSize;
    const paginationParams = `&limit=${pageSize}&offset=${offset}`;

    const finalUrl = `${baseUrl}?${query.replace(/\s+/g, '')}&order=data->txResponse->height.desc${paginationParams}`;

    try {
      // First, get the total count
      const countResponse = await axios.get(`${baseUrl}?${query.replace(/\s+/g, '')}`, {
        headers: {
          Prefer: 'count=exact',
          'Range-Unit': 'items',
          Range: '0-0', // We only need the count, not the actual data
        },
      });

      // Get the total count from the content-range header
      const contentRange = countResponse.headers['content-range'];
      const totalCount = contentRange ? parseInt(contentRange.split('/')[1]) : 0;

      console.log('Total count:', totalCount); // Debug log

      // Then get the paginated data
      const dataResponse = await axios.get(finalUrl, {
        headers: {
          'Range-Unit': 'items',
          Range: `${offset}-${offset + pageSize - 1}`,
        },
      });

      const transactions = dataResponse.data
        .map(transformTransaction)
        .filter((tx: any) => tx !== null)
        .filter((tx: any) => {
          if (!direction) return true;
          if (direction === 'send') return tx.data.from_address === address;
          if (direction === 'receive') return tx.data.to_address === address;
          return true;
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

  const queryKey = ['sendTx', address, direction, page, pageSize];

  const sendQuery = useQuery({
    queryKey,
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

export const useSendTxQuery = () => {
  const fetchTransactions = async () => {
    const baseUrl = 'https://testnet-indexer.liftedinit.tech/transactions';
    const query = `data->tx->body->messages.cs.[{"@type": "/cosmos.bank.v1beta1.MsgSend"}]`;

    const response = await axios.get(`${baseUrl}?${query}`);
    return response.data.map(transformTransaction).filter((tx: any) => tx !== null);
  };

  const sendQuery = useQuery({
    queryKey: ['sendTx'],
    queryFn: fetchTransactions,
    enabled: true,
  });

  return {
    sendTxs: sendQuery.data,
    isLoading: sendQuery.isLoading,
    isError: sendQuery.isError,
    error: sendQuery.error,
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
