import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdvancedMode } from "@/contexts";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/contexts";
import dynamic from "next/dynamic";
import { useEndpointStore } from "@/store/endpointStore";

export interface Endpoint {
  rpc: string;
  api: string;
  provider: string;
  isHealthy: boolean;
  network: "mainnet" | "testnet";
  custom: boolean;
}

const EndpointSelector: React.FC = () => {
  const { isAdvancedMode } = useAdvancedMode();
  const {
    endpoints,
    selectedEndpointKey,
    selectedEndpoint,
    setSelectedEndpointKey,
    addEndpoint,
    removeEndpoint,
    updateEndpointHealth,
  } = useEndpointStore((state) => ({
    endpoints: state.endpoints,
    selectedEndpointKey: state.selectedEndpointKey,
    selectedEndpoint: state.selectedEndpoint,
    setSelectedEndpointKey: state.setSelectedEndpointKey,
    addEndpoint: state.addEndpoint,
    removeEndpoint: state.removeEndpoint,
    updateEndpointHealth: state.updateEndpointHealth,
  }));
  const { setToastMessage } = useToast();
  const handleEndpointChange = useCallback(
    (endpoint: Endpoint) => {
      setSelectedEndpointKey(endpoint.provider);
    },
    [setSelectedEndpointKey]
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRPCEndpoint, setNewRPCEndpoint] = useState("");
  const [newAPIEndpoint, setNewAPIEndpoint] = useState("");
  const [endpointToRemove, setEndpointToRemove] = useState<string | null>(null);

  const { isLoading, error, refetch, data } = useQuery({
    queryKey: ["checkEndpoints", endpoints],
    queryFn: updateEndpointHealth,
    refetchInterval: 30000,
    enabled: true,
  });

  const handleCustomEndpointSubmit = async (e: {
    stopPropagation: () => void;
  }) => {
    e.stopPropagation();
    if (!newRPCEndpoint || !newAPIEndpoint) {
      setToastMessage({
        type: "alert-error",
        title: "Error adding custom endpoint",
        description: "Both RPC and API endpoints are required.",
        bgColor: "#e74c3c",
      });
      return;
    }

    const rpcUrl = newRPCEndpoint.startsWith("http")
      ? newRPCEndpoint
      : `https://${newRPCEndpoint}`;
    const apiUrl = newAPIEndpoint.startsWith("http")
      ? newAPIEndpoint
      : `https://${newAPIEndpoint}`;

    try {
      await addEndpoint(rpcUrl, apiUrl);
      setNewRPCEndpoint("");
      setNewAPIEndpoint("");
      setIsModalOpen(false);
      setToastMessage({
        type: "alert-success",
        title: "Custom endpoint added",
        description: "The new endpoint has been successfully added.",
        bgColor: "#2ecc71",
      });
    } catch (error) {
      console.error("Error adding custom endpoint:", error);
      let errorMessage = "An unknown error occurred while adding the endpoint.";

      if (error instanceof Error) {
        if (error.message.includes("Invalid URL")) {
          errorMessage =
            "Invalid URL format. Please check both RPC and API URLs.";
        } else if (error.message.includes("Network error")) {
          errorMessage =
            "Network error. Please check your internet connection and try again.";
        } else if (error.message.includes("Timeout")) {
          errorMessage =
            "Connection timeout. The endpoint might be unreachable.";
        } else {
          errorMessage = error.message;
        }
      }

      setToastMessage({
        type: "alert-error",
        title: "Error adding custom endpoint",
        description: errorMessage,
        bgColor: "#e74c3c",
      });
    }
  };

  const truncateUrl = (url: string) => {
    try {
      const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?$/;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = ipRegex.test(url) ? `http://${url}` : `https://${url}`;
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
              selectedEndpoint?.isHealthy ? "bg-primary" : "bg-secondary"
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
            {endpoints.map((endpoint: Endpoint, index: number) => (
              <li
                key={index}
                className={`flex flex-col p-2 rounded-lg cursor-pointer bg-base-300 ${
                  selectedEndpointKey === endpoint.provider
                    ? "bg-base-200"
                    : "hover:bg-base-200"
                }`}
                onClick={() => setSelectedEndpointKey(endpoint.provider)}
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
                  </div>
                  {isCustomEndpoint(endpoint) && (
                    <button
                      className={`btn btn-xs btn-circle absolute bottom-2 right-4 bg-[#1110] text-secondary hover:bg-[#1110] transition-all duration-300 z-[9999] ${
                        endpointToRemove === endpoint.provider
                          ? "rotate-90"
                          : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (endpointToRemove === endpoint.provider) {
                          removeEndpoint(endpoint.provider);
                          setEndpointToRemove(null);
                        } else {
                          setEndpointToRemove(endpoint.provider);
                        }
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {endpointToRemove === endpoint.provider ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                          />
                        )}
                      </svg>
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="divider"></div>
        <button
          className="btn btn-primary w-full"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
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
  { ssr: false }
);
