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

const validateRPCEndpoint = async (rpc: string): Promise<boolean> => {
  try {
    const url = new URL('status', rpc.trim());
    const response = await fetch(url.toString());
    console.log('RPC response status:', response.status);
    const data = await response.json();
    console.log('RPC response data:', data);

  
    if (data.result && data.result.node_info && data.result.sync_info) {
      const networkMatches = data.result.node_info.network === (process.env.NEXT_PUBLIC_CHAIN_ID || process.env.NEXT_PUBLIC_TESTNET_CHAIN_ID);
      const isNotCatchingUp = !data.result.sync_info.catching_up;
      console.log('Network matches:', networkMatches, 'Not catching up:', isNotCatchingUp);
      return true; 
    } else {
      console.log('Unexpected RPC response structure');
      return false;
    }
  } catch (error) {
    console.error("Error validating RPC endpoint:", error);
    return false;
  }
};

const validateAPIEndpoint = async (api: string): Promise<boolean> => {
  try {
    const url = new URL('cosmos/base/tendermint/v1beta1/syncing', api.trim());
    const response = await fetch(url.toString());
    return response.ok;
  } catch (error) {
    console.error('Error validating API endpoint:', error);
    return false;
  }
};

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
      setEndpoints: (endpoints) => set({ endpoints }),
      setSelectedEndpointKey: (key) => {
        const endpoint = get().endpoints.find((e) => e.provider === key);
        set({ selectedEndpointKey: key, selectedEndpoint: endpoint || null });
      },
      addEndpoint: async (rpc: string, api: string) => {
        try {
          const isRPCValid = await validateRPCEndpoint(rpc);
          const isAPIValid = await validateAPIEndpoint(api);
          
          console.log('RPC validation:', isRPCValid, 'API validation:', isAPIValid);
      
          if (isRPCValid && isAPIValid) {
            const rpcResponse = await fetch(`${rpc.trim()}status`);
            const rpcData = await rpcResponse.json();
            console.log('RPC data:', rpcData);
      
            const network = rpcData.result.node_info.network === (process.env.NEXT_PUBLIC_CHAIN_ID || process.env.NEXT_PUBLIC_TESTNET_CHAIN_ID) ? "mainnet" : "testnet";
            
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
          } else {
            throw new Error("Invalid endpoint(s). Please check the URLs and try again.");
          }
        } catch (error) {
          console.error('Error in addEndpoint:', error);
          throw error;
        }
      },
      removeEndpoint: (provider) => {
        const { endpoints, selectedEndpointKey } = get();
        const newEndpoints = endpoints.filter(e => e.provider !== provider);
        set({ endpoints: newEndpoints });
        if (selectedEndpointKey === provider) {
          const newSelectedEndpoint = newEndpoints[0];
          set({ 
            selectedEndpointKey: newSelectedEndpoint.provider,
            selectedEndpoint: newSelectedEndpoint
          });
        }
      },
      updateEndpointHealth: async () => {
        const { endpoints } = get();
        const updatedEndpoints = await Promise.all(
          endpoints.map(async (endpoint) => ({
            ...endpoint,
            isHealthy:
              (await validateRPCEndpoint(endpoint.rpc)) &&
              (await validateAPIEndpoint(endpoint.api)),
          }))
        );
        set({ endpoints: updatedEndpoints });
        return updatedEndpoints; // Return the updated endpoints
      },
    }),
    {
      name: 'endpoint-storage',
      getStorage: () => localStorage,
    }
  )
);