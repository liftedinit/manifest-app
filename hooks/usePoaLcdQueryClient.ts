import env from '@/config/env';
import { strangelove_ventures } from '@liftedinit/manifestjs';

import { useQuery } from '@tanstack/react-query';

const createLcdQueryClient = strangelove_ventures.ClientFactory.createLCDClient;

export const usePoaLcdQueryClient = () => {
  const lcdQueryClient = useQuery({
    queryKey: ['poaQueryClient', env.apiUrl],
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
