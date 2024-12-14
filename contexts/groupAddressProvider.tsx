import { ReactNode } from 'react';
import { useChain } from '@cosmos-kit/react';
import { useInitializeGroupStore } from '@/stores/groupAddressStore';
import env from '@/config/env';
interface GroupAddressProviderProps {
  children: ReactNode;
}

export const GroupAddressProvider = ({ children }: GroupAddressProviderProps) => {
  const { address } = useChain(env.chain);
  useInitializeGroupStore(address ?? '');
  return <>{children}</>;
};
