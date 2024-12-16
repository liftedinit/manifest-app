import env from '@/config/env';
import { osmosis } from '@liftedinit/manifestjs';
import { useQuery } from '@tanstack/react-query';

const createRpcQueryClient = osmosis.ClientFactory.createRPCQueryClient;

export const useOsmosisRpcQueryClient = () => {
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
