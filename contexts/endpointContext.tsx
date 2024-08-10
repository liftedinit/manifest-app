import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Endpoint {
  rpc: string;
  api: string;
  provider: string;
  isHealthy: boolean;
  network: "mainnet" | "testnet";
  custom: boolean;
}

interface EndpointContextType {
  selectedEndpoint: Endpoint;
  setSelectedEndpoint: (endpoint: Endpoint) => void;
  endpoints: Endpoint[];
  setEndpoints: (endpoints: Endpoint[]) => void;
}

const EndpointContext = createContext<EndpointContextType | undefined>(
  undefined
);

export const useEndpoint = () => {
  const context = useContext(EndpointContext);
  if (!context) {
    throw new Error("useEndpoint must be used within an EndpointProvider");
  }
  return context;
};

interface EndpointProviderProps {
  children: React.ReactNode;
}

export const EndpointProvider: React.FC<EndpointProviderProps> = ({
  children,
}) => {
  const [endpoints, setEndpoints] = useLocalStorage<Endpoint[]>(
    "endpoints",
    []
  );
  const [selectedEndpointKey, setSelectedEndpointKey] = useLocalStorage<string>(
    "selectedEndpointKey",
    "Mainnet"
  );

  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>({
    rpc: process.env.NEXT_PUBLIC_MAINNET_RPC_URL || "",
    api: process.env.NEXT_PUBLIC_MAINNET_API_URL || "",
    provider: "Mainnet",
    isHealthy: true,
    network: "mainnet",
    custom: false,
  });

  useEffect(() => {
    // Initialize endpoints if empty
    if (endpoints.length === 0) {
      const initialEndpoints: Endpoint[] = [
        {
          rpc: process.env.NEXT_PUBLIC_MAINNET_RPC_URL || "",
          api: process.env.NEXT_PUBLIC_MAINNET_API_URL || "",
          provider: "Mainnet",
          isHealthy: true,
          network: "mainnet",
          custom: false,
        },
        {
          rpc: process.env.NEXT_PUBLIC_TESTNET_RPC_URL || "",
          api: process.env.NEXT_PUBLIC_TESTNET_API_URL || "",
          provider: "Testnet",
          isHealthy: true,
          network: "testnet",
          custom: false,
        },
      ];
      setEndpoints(initialEndpoints);
    }
  }, [endpoints.length, setEndpoints]);

  useEffect(() => {
    const newSelectedEndpoint = endpoints.find(
      (e) => e.provider === selectedEndpointKey
    );

    if (newSelectedEndpoint && newSelectedEndpoint !== selectedEndpoint) {
      setSelectedEndpoint(newSelectedEndpoint);
    } else if (
      endpoints.length > 0 &&
      selectedEndpoint.provider !== endpoints[0].provider
    ) {
      setSelectedEndpoint(endpoints[0]);
      setSelectedEndpointKey(endpoints[0].provider);
    }
  }, [endpoints, selectedEndpointKey, setSelectedEndpoint, selectedEndpoint]);

  const contextValue: EndpointContextType = {
    selectedEndpoint,
    setSelectedEndpoint: (endpoint: Endpoint) => {
      setSelectedEndpoint(endpoint);
      setSelectedEndpointKey(endpoint.provider);
    },
    endpoints,
    setEndpoints,
  };

  return (
    <EndpointContext.Provider value={contextValue}>
      {children}
    </EndpointContext.Provider>
  );
};
