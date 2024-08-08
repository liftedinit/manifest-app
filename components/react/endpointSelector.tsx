// components/EndpointSelector.tsx

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdvancedMode } from "@/contexts";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Endpoint {
  rpc: string;
  api: string;
  provider: string;
  isHealthy: boolean;
  network: "mainnet" | "testnet";
  custom?: boolean;
}

const predefinedEndpoints: Endpoint[] = [
  {
    rpc: process.env.NEXT_PUBLIC_MAINNET_RPC_URL || "",
    api: process.env.NEXT_PUBLIC_MAINNET_API_URL || "",
    provider: "Mainnet",
    isHealthy: true,
    network: "mainnet",
  },
  {
    rpc: process.env.NEXT_PUBLIC_TESTNET_RPC_URL || "",
    api: process.env.NEXT_PUBLIC_TESTNET_API_URL || "",
    provider: "Testnet",
    isHealthy: true,
    network: "testnet",
  },
];

const validateRPCEndpoint = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(`${url}status`);
    const data = await response.json();
    const networkMatches =
      data.result.node_info.network === process.env.NEXT_PUBLIC_CHAIN_ID;
    const isNotCatchingUp = !data.result.sync_info.catching_up;
    return networkMatches && isNotCatchingUp;
  } catch (error) {
    console.error("Error validating RPC endpoint:", error);
    return false;
  }
};

const validateAPIEndpoint = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `${url}cosmos/base/tendermint/v1beta1/syncing`
    );
    const data = await response.json();
    return !data.syncing;
  } catch (error) {
    console.error("Error validating API endpoint:", error);
    return false;
  }
};

export const EndpointSelector: React.FC = () => {
  const { isAdvancedMode } = useAdvancedMode();
  const [customEndpoints, setCustomEndpoints] = useLocalStorage<Endpoint[]>(
    "customEndpoints",
    []
  );
  const [selectedEndpointKey, setSelectedEndpointKey] = useLocalStorage<string>(
    "selectedEndpoint",
    "mainnet"
  );

  const [endpoints, setEndpoints] = useState<Endpoint[]>(predefinedEndpoints);

  useEffect(() => {
    const updatedEndpoints = [
      ...predefinedEndpoints,
      ...customEndpoints.map((endpoint) => ({
        ...endpoint,
        provider: `Custom (${endpoint.network})`,
        custom: true,
      })),
    ];
    setEndpoints(updatedEndpoints);
  }, [customEndpoints]);

  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(
    predefinedEndpoints[0]
  );

  useEffect(() => {
    const found = endpoints.find((e) => e.provider === selectedEndpointKey);
    if (found) {
      setSelectedEndpoint(found);
    } else if (endpoints.length > 0) {
      setSelectedEndpoint(endpoints[0]);
      setSelectedEndpointKey(endpoints[0].provider);
    }
  }, [endpoints, selectedEndpointKey]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRPCEndpoint, setNewRPCEndpoint] = useState("");
  const [newAPIEndpoint, setNewAPIEndpoint] = useState("");

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["checkEndpoints"],
    queryFn: async () => {
      const updatedEndpoints = await Promise.all(
        endpoints.map(async (endpoint) => ({
          ...endpoint,
          isHealthy:
            (await validateRPCEndpoint(endpoint.rpc)) &&
            (await validateAPIEndpoint(endpoint.api)),
        }))
      );
      return updatedEndpoints;
    },
    refetchInterval: 30000,
    enabled: false,
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (data) {
      setEndpoints((prevEndpoints) => {
        const updatedEndpoints = prevEndpoints.map((endpoint) => {
          const matchingEndpoint = data.find(
            (e) => e.rpc === endpoint.rpc && e.api === endpoint.api
          );
          return matchingEndpoint || endpoint;
        });
        return updatedEndpoints;
      });
    }
  }, [data]);

  const handleEndpointChange = (endpoint: Endpoint) => {
    setSelectedEndpoint(endpoint);
    setSelectedEndpointKey(endpoint.provider);
  };

  const handleCustomEndpointSubmit = async () => {
    if (!newRPCEndpoint || !newAPIEndpoint) return;

    const rpcUrl = newRPCEndpoint.startsWith("http")
      ? newRPCEndpoint
      : `https://${newRPCEndpoint}`;
    const apiUrl = newAPIEndpoint.startsWith("http")
      ? newAPIEndpoint
      : `https://${newAPIEndpoint}`;

    const isRPCValid = await validateRPCEndpoint(rpcUrl);
    const isAPIValid = await validateAPIEndpoint(apiUrl);

    if (isRPCValid && isAPIValid) {
      try {
        const rpcResponse = await fetch(`${rpcUrl}status`);
        const rpcData = await rpcResponse.json();
        const network =
          rpcData.result.node_info.network === process.env.NEXT_PUBLIC_CHAIN_ID
            ? "mainnet"
            : "testnet";

        const newEndpoint: Endpoint = {
          rpc: rpcUrl,
          api: apiUrl,
          provider: `Custom (${network})`,
          isHealthy: true,
          network,
          custom: true,
        };

        setCustomEndpoints((prev: Endpoint[]) => [...prev, newEndpoint]);
        setSelectedEndpointKey(newEndpoint.provider);
        setNewRPCEndpoint("");
        setNewAPIEndpoint("");
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error adding custom endpoint:", error);
        alert(
          "An error occurred while adding the custom endpoint. Please try again."
        );
      }
    } else {
      alert("Invalid endpoint(s). Please check the URLs and try again.");
    }
  };

  const truncateUrl = (url: string) => {
    try {
      const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?$/;

      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        if (ipRegex.test(url)) {
          url = "http://" + url;
        } else {
          url = "https://" + url;
        }
      }

      const parsedUrl = new URL(url);
      return `${parsedUrl.host}/...`;
    } catch (error) {
      console.error("Invalid URL:", url);
      return url;
    }
  };

  const handleRemoveEndpoint = (endpointToRemove: Endpoint) => {
    setCustomEndpoints((prev: Endpoint[]) =>
      prev.filter((endpoint) => endpoint !== endpointToRemove)
    );

    if (selectedEndpoint === endpointToRemove) {
      const newSelectedEndpoint =
        endpoints.find((e) => !e.custom) || endpoints[0];
      setSelectedEndpoint(newSelectedEndpoint);
      setSelectedEndpointKey(newSelectedEndpoint.provider);
    }
  };

  return (
    <div
      className={`absolute top-2 right-2 dropdown dropdown-bottom dropdown-end ${
        isAdvancedMode ? "block" : "hidden"
      }`}
    >
      <label
        tabIndex={0}
        className="btn btn-primary btn-outline m-1 flex items-center justify-between"
      >
        <div className="flex items-center">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              selectedEndpoint.isHealthy ? "bg-primary" : "bg-secondary"
            }`}
          ></div>
          <span className="text-white">{selectedEndpoint.provider}</span>
        </div>
        <ChevronDownIcon className="w-5 h-5 ml-2" />
      </label>
      <div
        tabIndex={0}
        className="dropdown-content menu p-4 shadow bg-base-100 rounded-box w-[26rem] z-[9999]"
      >
        <h3 className="font-bold text-lg mb-4">Available Endpoints</h3>
        {isLoading ? (
          <p>Checking endpoints...</p>
        ) : error ? (
          <p>Error checking endpoints</p>
        ) : (
          <ul className="space-y-4">
            {endpoints.map((endpoint, index) => (
              <li
                key={index}
                className={`flex flex-col p-2 rounded-lg cursor-pointer bg-base-300 ${
                  selectedEndpoint === endpoint
                    ? "bg-base-200"
                    : "hover:bg-base-200"
                }`}
                onClick={() => handleEndpointChange(endpoint)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-md font-semibold">{endpoint.provider}</p>
                    <p className="text-sm text-gray-500">
                      Provider: {truncateUrl(endpoint.rpc)}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        endpoint.isHealthy ? "bg-primary" : "bg-secondary"
                      }`}
                    ></div>
                    {endpoint.custom && (
                      <button
                        className="ml-2 text-secondary hover:text-secondary-focus"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveEndpoint(endpoint);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="divider"></div>
        <button
          className="btn btn-primary w-full"
          onClick={() => setIsModalOpen(true)}
        >
          Add Custom Endpoints
        </button>
      </div>
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Add Custom Endpoint</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">RPC Endpoint</span>
              </label>
              <input
                type="text"
                placeholder="Enter RPC URL"
                className="input input-bordered"
                value={newRPCEndpoint}
                onChange={(e) => setNewRPCEndpoint(e.target.value)}
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">API Endpoint</span>
              </label>
              <input
                type="text"
                placeholder="Enter API URL"
                className="input input-bordered"
                value={newAPIEndpoint}
                onChange={(e) => setNewAPIEndpoint(e.target.value)}
              />
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCustomEndpointSubmit}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
