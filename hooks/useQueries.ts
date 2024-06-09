import { useEffect, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { QueryGroupsByMemberResponseSDKType } from "@chalabi/manifestjs/dist/codegen/cosmos/group/v1/query";

import { useLcdQueryClient } from "./useLcdQueryClient";
import { usePoaLcdQueryClient } from "./usePoaLcdQueryClient";
import { getLogoUrls } from "@/utils";
import { ExtendedValidatorSDKType } from "@/components";

export interface IPFSMetadata {
    title: string;
    authors: string;
    summary: string;
    details: string;
    proposalForumURL: string;
    voteOptionContext: string;
}

export type ExtendedGroupType = QueryGroupsByMemberResponseSDKType['groups'][0] & {
    ipfsMetadata: IPFSMetadata | null;
    policies: any[];
    members: any[];
};

export interface ExtendedQueryGroupsByMemberResponseSDKType {
    groups: ExtendedGroupType[];
}

export const useGroupsByMember = (address: string) => {
    const { lcdQueryClient } = useLcdQueryClient();
    const [extendedGroups, setExtendedGroups] = useState<ExtendedQueryGroupsByMemberResponseSDKType>({ groups: [] });
    const [allDataLoaded, setAllDataLoaded] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const groupQuery = useQuery({
        queryKey: ["groupInfo", address],
        queryFn: () => lcdQueryClient?.cosmos.group.v1.groupsByMember({ address }),
        enabled: !!lcdQueryClient && !!address,
        staleTime: Infinity,
    });

    useEffect(() => {
        const fetchAdditionalData = async () => {
            if (groupQuery.data?.groups && !groupQuery.isLoading) {
                try {
                    const policyPromises = groupQuery.data.groups.map(group => 
                        lcdQueryClient?.cosmos.group.v1.groupPoliciesByGroup({ group_id: group.id }));
                    const memberPromises = groupQuery.data.groups.map(group => 
                        lcdQueryClient?.cosmos.group.v1.groupMembers({ group_id: group.id }));
                    const ipfsPromises = groupQuery.data.groups.map(group => 
                        fetch(`https://nodes.chandrastation.com/ipfs/gateway/${group.metadata}`)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`HTTP error! Status: ${response.status}`);
                                }
                                return response.json() as Promise<IPFSMetadata>;
                            }));

                    const [policiesResults, membersResults, ipfsResults] = await Promise.all([
                        Promise.all(policyPromises),
                        Promise.all(memberPromises),
                        Promise.all(ipfsPromises)
                    ]);

                    const groupsWithAllData = groupQuery.data.groups.map((group, index) => ({
                        ...group,
                        ipfsMetadata: ipfsResults[index],
                        policies: policiesResults[index]?.group_policies || [],
                        members: membersResults[index]?.members || []
                    }));

                    setExtendedGroups({ groups: groupsWithAllData });
                } catch (err) {
                    console.error("Failed to fetch additional group data:", err);
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
    const [extendedGroups, setExtendedGroups] = useState<ExtendedQueryGroupsByMemberResponseSDKType>({ groups: [] });
    const [allDataLoaded, setAllDataLoaded] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const groupQuery = useQuery({
        queryKey: ["groupInfo", admin],
        queryFn: () => lcdQueryClient?.cosmos.group.v1.groupsByAdmin({ admin }),
        enabled: !!lcdQueryClient && !!admin,
        staleTime: Infinity,
    });

    useEffect(() => {
        const fetchAdditionalData = async () => {
            if (groupQuery.data?.groups && !groupQuery.isLoading) {
                try {
                    const policyPromises = groupQuery.data.groups.map(group => 
                        lcdQueryClient?.cosmos.group.v1.groupPoliciesByGroup({ group_id: group.id }));
                    const memberPromises = groupQuery.data.groups.map(group => 
                        lcdQueryClient?.cosmos.group.v1.groupMembers({ group_id: group.id }));
                    const ipfsPromises = groupQuery.data.groups.map(group => 
                        fetch(`https://nodes.chandrastation.com/ipfs/gateway/${group.metadata}`)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`HTTP error! Status: ${response.status}`);
                                }
                                return response.json() as Promise<IPFSMetadata>;
                            }));

                    const [policiesResults, membersResults, ipfsResults] = await Promise.all([
                        Promise.all(policyPromises),
                        Promise.all(memberPromises),
                        Promise.all(ipfsPromises)
                    ]);

                    const groupsWithAllData = groupQuery.data.groups.map((group, index) => ({
                        ...group,
                        ipfsMetadata: ipfsResults[index],
                        policies: policiesResults[index]?.group_policies || [],
                        members: membersResults[index]?.members || []
                    }));

                    setExtendedGroups({ groups: groupsWithAllData });
                } catch (err) {
                    console.error("Failed to fetch additional group data:", err);
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
            throw new Error("LCD Client not ready");
        }
        return await lcdQueryClient.cosmos.group.v1.groupPoliciesByGroup({ group_id: groupId});
    };

    const policyQuery = useQuery({
        queryKey: ["policyInfo", groupId],
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

}

export const useMembersById = (groupId: bigint) => {
    const { lcdQueryClient } = useLcdQueryClient();

    const fetchGroupInfo = async () => {
        if (!lcdQueryClient) {
            throw new Error("LCD Client not ready");
        }
        return await lcdQueryClient.cosmos.group.v1.groupMembers({ group_id: groupId});
    };

    const memberQuery = useQuery({
        queryKey: ["memberInfo", groupId],
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

}

export const useProposalsByPolicyAccount = (policyAccount: string) => {
    const { lcdQueryClient } = useLcdQueryClient();

    const fetchGroupInfo = async () => {
        if (!lcdQueryClient) {
            throw new Error("LCD Client not ready");
        }
        return await lcdQueryClient.cosmos.group.v1.proposalsByGroupPolicy({ address: policyAccount});
    };

    const proposalQuery = useQuery({
        queryKey: ["proposalInfo", policyAccount],
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
}

export const useProposalsByPolicyAccountAll = (policyAccounts: string[]) => {
    const { lcdQueryClient } = useLcdQueryClient();
  
    const fetchGroupInfo = async (policyAccount: string) => {
      if (!lcdQueryClient) {
        throw new Error("LCD Client not ready");
      }
      return await lcdQueryClient.cosmos.group.v1.proposalsByGroupPolicy({ address: policyAccount });
    };
  
    const proposalQueries = useQueries({
      queries: policyAccounts.map((policyAccount) => ({
        queryKey: ["proposalInfo", policyAccount],
        queryFn: () => fetchGroupInfo(policyAccount),
        enabled: !!lcdQueryClient && !!policyAccount,
        staleTime: Infinity,
      }))
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
            throw new Error("LCD Client not ready");
        }
        return await lcdQueryClient.cosmos.group.v1.tallyResult({ proposal_id: proposalId});
    };

    const tallyQuery = useQuery({
        queryKey: ["tallyInfo", proposalId],
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
}

export const useVotesByProposal = (proposalId: bigint) => {
    const { lcdQueryClient } = useLcdQueryClient();

    const fetchGroupInfo = async () => {
        if (!lcdQueryClient) {
            throw new Error("LCD Client not ready");
        }
        return await lcdQueryClient.cosmos.group.v1.votesByProposal({ proposal_id: proposalId});
    };

    const voteQuery = useQuery({
        queryKey: ["voteInfo", proposalId],
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
}

export const useBalance = (address: string) => {
    const { lcdQueryClient } = useLcdQueryClient();

    const fetchBalance = async () => {
        if (!lcdQueryClient) {
            throw new Error("LCD Client not ready");
        }
        return await lcdQueryClient.cosmos.bank.v1beta1.balance({ denom: "umfx", address});
    };

    const balanceQuery = useQuery({
        queryKey: ["balanceInfo", address],
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
}

export const usePoaParams = () => {
    const { lcdQueryClient } = usePoaLcdQueryClient();

    const fetchParams = async () => {
        if (!lcdQueryClient) {
            throw new Error("LCD Client not ready");
        }
        return await lcdQueryClient.strangelove_ventures.poa.v1.params({});
    };

    const paramsQuery = useQuery({
        queryKey: ["paramsInfo"],
        queryFn: fetchParams,
        enabled: !!lcdQueryClient,
        staleTime: Infinity,
    });

    return {
        poaParams: paramsQuery.data?.params,
        isPoaParamsLoading: paramsQuery.isLoading,
        isPoaParamsError: paramsQuery.isError,
        refetchPoaParams: paramsQuery.refetch,
    };
    
}

export const usePendingValidators = () => {
    const { lcdQueryClient } = usePoaLcdQueryClient();

    const fetchParams = async () => {
        if (!lcdQueryClient) {
            throw new Error("LCD Client not ready");
        }
        return await lcdQueryClient.strangelove_ventures.poa.v1.pendingValidators({});
    };

    const paramsQuery = useQuery({
        queryKey: ["pendingVals"],
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
    
}

export const useConsensusPower = (address: string) => {
    const { lcdQueryClient } = usePoaLcdQueryClient();

    const fetchParams = async () => {
        if (!lcdQueryClient) {
            throw new Error("LCD Client not ready");
        }
        return await lcdQueryClient.strangelove_ventures.poa.v1.consensusPower({validator_address: address});
    };

    const paramsQuery = useQuery({
        queryKey: ["consensusPower", address],
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
    
}

export const useStakingParams = () => {
    const { lcdQueryClient } = useLcdQueryClient();

    const fetchParams = async () => {
        if (!lcdQueryClient) {
            throw new Error("LCD Client not ready");
        }
        return await lcdQueryClient.cosmos.staking.v1beta1.params({});
    };

    const paramsQuery = useQuery({
        queryKey: ["stakingParams"],
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
    
}

export const useValidators = () => {
    const { lcdQueryClient } = useLcdQueryClient();
    const { lcdQueryClient: poaLcdQueryCLient } = usePoaLcdQueryClient();
    const fetchConsensusPower = async (validators: any[]) => {
      if (!lcdQueryClient || !poaLcdQueryCLient) {
        throw new Error("LCD Client not ready");
      }
  
      const promises = validators.map(async (validator) => {
        const consensusPowerResponse = await poaLcdQueryCLient.strangelove_ventures.poa.v1.consensusPower({
          validator_address: validator.operator_address,
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
        throw new Error("LCD Client not ready");
      }
      const validatorsResponse = await lcdQueryClient.cosmos.staking.v1beta1.validators({
        status: "BOND_STATUS_BONDED",
      });
      const validatorsWithConsensusPower = await fetchConsensusPower(validatorsResponse.validators);
      return validatorsWithConsensusPower;
    };
  
    const paramsQuery = useQuery({
      queryKey: ["validators"],
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
  

