import { osmosis } from '@liftedinit/manifestjs';
import { useQuery } from '@tanstack/react-query';
import env from '@/config/env';

const createRpcQueryClient = osmosis.ClientFactory.createRPCQueryClient;

export const useRpcQueryClient = () => {
  const rpcQueryClient = useQuery({
    queryKey: ['rpcQueryClient', env.rpcUrl],
    queryFn: () =>
      createRpcQueryClient({
        rpcEndpoint: env.rpcUrl,
      }),
    enabled: !!env.rpcUrl,
    staleTime: Infinity,
  });

  return {
    rpcQueryClient: rpcQueryClient.data,
  };
};
