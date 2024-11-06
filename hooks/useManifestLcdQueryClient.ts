import { useState, useEffect } from 'react';
import { osmosis } from '@liftedinit/manifestjs';

import { useQuery } from '@tanstack/react-query';
import { useChain } from '@cosmos-kit/react';
import { chainName } from '../config';
import { useEndpointStore } from '@/store/endpointStore';

const createLcdQueryClient = osmosis.ClientFactory.createLCDClient;

export const useManifestLcdQueryClient = () => {
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
