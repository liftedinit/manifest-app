import { useState, useEffect } from 'react';
import { cosmos } from '@chalabi/manifestjs';
import { useQuery } from '@tanstack/react-query';
import { useChain } from '@cosmos-kit/react';
import { chainName } from '../config';
import { useEndpointStore } from '@/store/endpointStore';

const createLcdQueryClient = cosmos.ClientFactory.createLCDClient;

export const useLcdQueryClient = () => {
  const { selectedEndpoint } = useEndpointStore();

  const lcdQueryClient = useQuery({
    queryKey: ['lcdQueryClient', selectedEndpoint?.api],
    queryFn: () =>
      createLcdQueryClient({
        restEndpoint: selectedEndpoint?.api || '',
      }),
    enabled: !!selectedEndpoint?.api,
    staleTime: Infinity,
  });

  return {
    lcdQueryClient: lcdQueryClient.data,
  };
};
