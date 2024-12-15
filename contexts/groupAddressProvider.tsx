import { ReactNode, useEffect } from 'react';
import { useChain } from '@cosmos-kit/react';
import { useInitializeGroupStore } from '@/stores/groupAddressStore';
import env from '@/config/env';
import { useGroupAddressStore } from '@/stores/groupAddressStore';

interface GroupAddressProviderProps {
  children: ReactNode;
}

export const GroupAddressProvider = ({ children }: GroupAddressProviderProps) => {
  const { address, isWalletConnected } = useChain(env.chain);

  useEffect(() => {
    if (address && isWalletConnected) {
      useGroupAddressStore.getState().setSelectedAddress(address);
    }
  }, [address, isWalletConnected]);

  useInitializeGroupStore(address || '');

  return <>{children}</>;
};
