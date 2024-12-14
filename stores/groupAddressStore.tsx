// stores/groupAddressStore.tsx
import { create } from 'zustand';
import { ExtendedGroupType, useGroupsByMember } from '@/hooks/useQueries';
import { useEffect } from 'react';

interface GroupAddressStore {
  groups: ExtendedGroupType[];
  policyAddresses: string[];
  selectedAddress: string | null;
  setSelectedAddress: (address: string | null) => void;
  refetchGroupByMember: () => void;
  isGroupByMemberLoading: boolean;
  isGroupByMemberError: boolean | Error;
}

export const useGroupAddressStore = create<GroupAddressStore>(set => ({
  groups: [],
  policyAddresses: [],
  selectedAddress: null,
  setSelectedAddress: address => set({ selectedAddress: address }),
  refetchGroupByMember: () => set({ groups: [], policyAddresses: [] }),
  isGroupByMemberLoading: false,
  isGroupByMemberError: false,
}));

// Custom hook to sync the query data with the store
export const useInitializeGroupStore = (address: string) => {
  const { groupByMemberData, isGroupByMemberLoading, isGroupByMemberError, refetchGroupByMember } =
    useGroupsByMember(address);

  useEffect(() => {
    if (groupByMemberData?.groups) {
      const policyAddresses = groupByMemberData.groups.flatMap(group =>
        group.policies.map(policy => policy.address)
      );

      useGroupAddressStore.setState({
        groups: groupByMemberData.groups,
        policyAddresses,
        // Only set selectedAddress if it's not already set
        selectedAddress:
          useGroupAddressStore.getState().selectedAddress ?? policyAddresses[0] ?? null,
        isGroupByMemberLoading,
        isGroupByMemberError,
        refetchGroupByMember,
      });
    }
  }, [groupByMemberData]);
};
