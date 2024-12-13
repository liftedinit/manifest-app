import { osmosis } from '@liftedinit/manifestjs';
import { useEndpointStore } from '@/store/endpointStore';
import { useQuery } from '@tanstack/react-query';

const createRpcQueryClient = osmosis.ClientFactory.createRPCQueryClient;

export const useOsmosisRpcQueryClient = () => {
  const { selectedEndpoint } = useEndpointStore();

  const rpcQueryClient = useQuery({
    queryKey: ['rpcQueryClient', selectedEndpoint?.rpc],
    queryFn: () =>
      createRpcQueryClient({
        rpcEndpoint: selectedEndpoint?.rpc || '',
      }),
    enabled: !!selectedEndpoint?.rpc,
    staleTime: Infinity,
  });

  return {
    rpcQueryClient: rpcQueryClient.data,
  };
};
