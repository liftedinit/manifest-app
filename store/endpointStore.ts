import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Endpoint {
  rpc: string;
  api: string;
  provider: string;
  isHealthy: boolean;
  network: 'mainnet' | 'testnet';
  custom: boolean;
}

interface EndpointState {
  endpoints: Endpoint[];
  selectedEndpointKey: string;
  selectedEndpoint: Endpoint | null;
  setEndpoints: (endpoints: Endpoint[]) => void;
  setSelectedEndpointKey: (key: string) => void;
  addEndpoint: (rpc: string, api: string) => Promise<void>;
  removeEndpoint: (provider: string) => void;
  updateEndpointHealth: () => Promise<Endpoint[]>;
}

const defaultEndpoints: Endpoint[] = [
  {
    rpc: process.env.NEXT_PUBLIC_MAINNET_RPC_URL || '',
    api: process.env.NEXT_PUBLIC_MAINNET_API_URL || '',
    provider: 'Mainnet',
    isHealthy: true,
    network: 'mainnet',
    custom: false,
  },
  {
    rpc: process.env.NEXT_PUBLIC_TESTNET_RPC_URL || '',
    api: process.env.NEXT_PUBLIC_TESTNET_API_URL || '',
    provider: 'Testnet',
    isHealthy: true,
    network: 'testnet',
    custom: false,
  },
];

export const useEndpointStore = create(
  persist<EndpointState>(
    (set, get) => ({
      endpoints: defaultEndpoints,
      selectedEndpointKey: 'Mainnet',
      selectedEndpoint: defaultEndpoints[0],
      setEndpoints: endpoints => set({ endpoints }),
      setSelectedEndpointKey: key => {
        const endpoint = get().endpoints.find(e => e.provider === key);
        set({ selectedEndpointKey: key, selectedEndpoint: endpoint || null });
      },
      addEndpoint: async (rpc: string, api: string) => {
        try {
          const rpcResponse = await fetch(`${rpc.trim()}/status`);
          const rpcData = await rpcResponse.json();

          const network =
            rpcData.result.node_info.network ===
            (process.env.NEXT_PUBLIC_CHAIN_ID || process.env.NEXT_PUBLIC_TESTNET_CHAIN_ID)
              ? 'mainnet'
              : 'testnet';

          const newEndpoint: Endpoint = {
            rpc: rpc.trim(),
            api: api.trim(),
            provider: `Custom (${network})`,
            isHealthy: true,
            network,
            custom: true,
          };

          const { endpoints } = get();
          set({
            endpoints: [...endpoints, newEndpoint],
          });
        } catch (error) {
          console.error('Error in addEndpoint:', error);
          throw error;
        }
      },
      removeEndpoint: provider => {
        const { endpoints, selectedEndpointKey } = get();
        const newEndpoints = endpoints.filter(e => e.provider !== provider);
        set({ endpoints: newEndpoints });
        if (selectedEndpointKey === provider) {
          const newSelectedEndpoint = newEndpoints[0];
          set({
            selectedEndpointKey: newSelectedEndpoint.provider,
            selectedEndpoint: newSelectedEndpoint,
          });
        }
      },
      updateEndpointHealth: async () => {
        const { endpoints } = get();
        const updatedEndpoints = await Promise.all(
          endpoints.map(async endpoint => {
            try {
              const rpcResponse = await fetch(endpoint.rpc.trim(), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  id: 1,
                  method: 'status',
                  params: [],
                }),
              });

              const baseApiUrl = endpoint.api.trim().endsWith('/')
                ? endpoint.api.trim().slice(0, -1)
                : endpoint.api.trim();
              const apiResponse = await fetch(
                `${baseApiUrl}/cosmos/base/tendermint/v1beta1/syncing`
              );

              const rpcData = await rpcResponse.json();
              const isHealthy =
                rpcResponse.ok &&
                apiResponse.ok &&
                rpcData?.result?.sync_info?.catching_up === false;

              return {
                ...endpoint,
                isHealthy,
              };
            } catch (error) {
              console.error('Error checking endpoint health:', error);
              return {
                ...endpoint,
                isHealthy: false,
              };
            }
          })
        );
        set({ endpoints: updatedEndpoints });
        return updatedEndpoints;
      },
    }),
    {
      name: 'endpoint-storage',
      getStorage: () => localStorage,
    }
  )
);
