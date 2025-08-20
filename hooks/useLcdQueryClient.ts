import { cosmos } from '@manifest-network/manifestjs';
import { useQuery } from '@tanstack/react-query';

import env from '@/config/env';

const createLcdQueryClient = cosmos.ClientFactory.createLCDClient;

export const useLcdQueryClient = () => {
  const lcdQueryClient = useQuery({
    queryKey: ['lcdQueryClientCosmos', env.apiUrl],
    queryFn: () =>
      createLcdQueryClient({
        restEndpoint: env.apiUrl,
      }),
    enabled: !!env.apiUrl,
    staleTime: Infinity,
  });

  return {
    lcdQueryClient: lcdQueryClient.data,
  };
};

export const useOsmosisLcdQueryClient = () => {
  const lcdQueryClient = useQuery({
    queryKey: ['lcdQueryClientOsmosis', env.osmosisApiUrl],
    queryFn: () =>
      createLcdQueryClient({
        restEndpoint: env.osmosisApiUrl,
      }),
    enabled: !!env.osmosisApiUrl,
    staleTime: Infinity,
  });

  return {
    lcdQueryClient: lcdQueryClient.data,
  };
};
