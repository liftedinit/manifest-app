import { strangelove_ventures } from '@manifest-network/manifestjs';
import { useQuery } from '@tanstack/react-query';

import env from '@/config/env';

const createLcdQueryClient = strangelove_ventures.ClientFactory.createLCDClient;

export const usePoaLcdQueryClient = () => {
  const lcdQueryClient = useQuery({
    queryKey: ['lcdQueryClientPOA', env.apiUrl],
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
