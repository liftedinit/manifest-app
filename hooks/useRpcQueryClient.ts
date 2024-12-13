import { useState, useEffect } from 'react';
import { osmosis } from '@liftedinit/manifestjs';
import { useQuery } from '@tanstack/react-query';
import { useChain } from '@cosmos-kit/react';
import { chainName } from '../config';
import { useEndpointStore } from '@/store/endpointStore';

const createRpcQueryClient = osmosis.ClientFactory.createRPCQueryClient;

export const useRpcQueryClient = () => {
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
