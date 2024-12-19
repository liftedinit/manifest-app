import env from '@/config/env';
import { cosmos } from '@liftedinit/manifestjs';
import { useQuery } from '@tanstack/react-query';

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
