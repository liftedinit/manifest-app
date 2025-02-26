import { osmosis } from '@liftedinit/manifestjs';
import { useQuery } from '@tanstack/react-query';

import env from '@/config/env';

const createLcdQueryClient = osmosis.ClientFactory.createLCDClient;

export const useManifestLcdQueryClient = () => {
  const lcdQueryClient = useQuery({
    queryKey: ['lcdQueryClientOsmosis', env.apiUrl],
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
