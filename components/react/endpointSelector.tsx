import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdvancedMode } from "@/contexts";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useEndpoint } from "@/contexts/endpointContext";
import dynamic from "next/dynamic";

interface Endpoint {
  rpc: string;
  api: string;
  provider: string;
  isHealthy: boolean;
  network: "mainnet" | "testnet";
  custom: boolean;
}

const predefinedEndpoints: Endpoint[] = [
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

const validateRPCEndpoint = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(`${url}status`);
    const data = await response.json();
    const networkMatches =
      data.result.node_info.network === process.env.NEXT_PUBLIC_CHAIN_ID ||
      "manifest-ledger-beta";
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

const EndpointSelector: React.FC = () => {
  const { isAdvancedMode } = useAdvancedMode();
  const [customEndpoints, setCustomEndpoints] = useLocalStorage<Endpoint[]>(
    "customEndpoints",
    []
  );
  const [selectedEndpointKey, setSelectedEndpointKey] = useLocalStorage<string>(
    "selectedEndpoint",
    "Mainnet"
  );

  const { setSelectedEndpoint } = useEndpoint();
  const [localEndpoints, setLocalEndpoints] = useState<Endpoint[]>([]);

  const allEndpoints = useMemo(() => {
    return [...predefinedEndpoints, ...customEndpoints];
  }, [predefinedEndpoints, customEndpoints]);

  useEffect(() => {
    const selectedEndpoint =
      allEndpoints.find((e) => e.provider === selectedEndpointKey) ||
      allEndpoints[0];

    if (selectedEndpoint && selectedEndpoint.provider !== selectedEndpointKey) {
      setSelectedEndpoint(selectedEndpoint);
      setSelectedEndpointKey(selectedEndpoint.provider);
    }
  }, [
    selectedEndpointKey,
    allEndpoints,
    setSelectedEndpoint,
    setSelectedEndpointKey,
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRPCEndpoint, setNewRPCEndpoint] = useState("");
  const [newAPIEndpoint, setNewAPIEndpoint] = useState("");

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["checkEndpoints"],
    queryFn: async () => {
      const updatedEndpoints = await Promise.all(
        localEndpoints.map(async (endpoint) => ({
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
      setLocalEndpoints(data);
    }
  }, [data]);

  const handleEndpointChange = (endpoint: Endpoint) => {
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
          rpcData.result.node_info.network ===
            process.env.NEXT_PUBLIC_CHAIN_ID || "manifest-ledger-beta"
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

  const handleRemoveEndpoint = (endpointToRemove: Endpoint) => {
    setSelectedEndpoint(predefinedEndpoints[0]);
    if (endpointToRemove.custom) {
      const updatedCustomEndpoints = customEndpoints.filter(
        (endpoint) => endpoint !== endpointToRemove
      );
      setCustomEndpoints(updatedCustomEndpoints);

      if (selectedEndpointKey === endpointToRemove.provider) {
        const newSelectedEndpoint =
          localEndpoints.find((e) => !e.custom) || localEndpoints[0];
        setSelectedEndpoint(newSelectedEndpoint);
        setSelectedEndpointKey(newSelectedEndpoint.provider);
      }
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

  const isCustomEndpoint = (endpoint: Endpoint) => endpoint.custom;

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
              allEndpoints.find((e) => e.provider === selectedEndpointKey)
                ?.isHealthy
                ? "bg-primary"
                : "bg-secondary"
            }`}
          ></div>
          <span className="text-white">{selectedEndpointKey}</span>
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
            {allEndpoints.map((endpoint, index) => (
              <li
                key={index}
                className={`flex flex-col p-2 rounded-lg cursor-pointer bg-base-300 ${
                  selectedEndpointKey === endpoint.provider
                    ? "bg-base-200"
                    : "hover:bg-base-200"
                }`}
                onClick={() => handleEndpointChange(endpoint)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-md font-semibold">
                      {endpoint.custom
                        ? `Custom (${endpoint.network})`
                        : endpoint.provider}
                    </p>
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
                    {isCustomEndpoint(endpoint) && (
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

export const DynamicEndpointSelector = dynamic(
  () => Promise.resolve(EndpointSelector),
  {
    ssr: false,
  }
);
