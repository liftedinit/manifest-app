import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QueryGroupsByMemberResponseSDKType } from "@chalabi/manifestjs/dist/codegen/cosmos/group/v1/query";

import { useLcdQueryClient } from "./useLcdQueryClient";

export interface IPFSMetadata {
    title: string;
    authors: string;
    summary: string;
    details: string;
    proposalForumURL: string;
    voteOptionContext: string;
}

type ExtendedGroupType = QueryGroupsByMemberResponseSDKType['groups'][0] & {
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
    const [loading, setLoading] = useState(false);
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
                setLoading(true);
                try {
                    const policyPromises = groupQuery.data.groups.map(group => 
                        lcdQueryClient?.cosmos.group.v1.groupPoliciesByGroup({ groupId: group.id }));
                    const memberPromises = groupQuery.data.groups.map(group => 
                        lcdQueryClient?.cosmos.group.v1.groupMembers({ groupId: group.id }));
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
                    setLoading(false);
                }
            }
        };

        fetchAdditionalData();
    }, [groupQuery.data, groupQuery.isLoading, lcdQueryClient?.cosmos.group.v1]);

    return {
        groupByMemberData: extendedGroups,
        isGroupByMemberLoading: loading || groupQuery.isLoading,
        isGroupByMemberError: error || groupQuery.isError,
        refetchGroupByMember: groupQuery.refetch,
    };
};


export const usePoliciesById = (groupId: string) => {
    const { lcdQueryClient } = useLcdQueryClient();

    const fetchGroupInfo = async () => {
        if (!lcdQueryClient) {
            throw new Error("LCD Client not ready");
        }
        return await lcdQueryClient.cosmos.group.v1.groupPoliciesByGroup({ groupId: groupId});
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

export const useMembersById = (groupId: string) => {
    const { lcdQueryClient } = useLcdQueryClient();

    const fetchGroupInfo = async () => {
        if (!lcdQueryClient) {
            throw new Error("LCD Client not ready");
        }
        return await lcdQueryClient.cosmos.group.v1.groupMembers({ groupId: groupId});
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