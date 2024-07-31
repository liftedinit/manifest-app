

import { useState, useEffect } from "react";
import { manifest, strangelove_ventures } from "@chalabi/manifestjs";

import { useQuery } from "@tanstack/react-query";
import { useChain } from "@cosmos-kit/react";
import { chainName } from "../config";

const createLcdQueryClient = strangelove_ventures.ClientFactory.createLCDClient;

export const usePoaLcdQueryClient = () => {
  const { getRestEndpoint } = useChain(chainName);
  const [resolvedRestEndpoint, setResolvedRestEndpoint] = useState<
    string | null
  >(null);

  useEffect(() => {
    const resolveEndpoint = async () => {
      const endpoint = await getRestEndpoint();

      if (typeof endpoint === "string") {
        setResolvedRestEndpoint(endpoint);
      } else if (endpoint && typeof endpoint === "object") {
        setResolvedRestEndpoint(endpoint.url);
      }
    };

    resolveEndpoint();
  }, [getRestEndpoint]);

  const lcdQueryClient = useQuery({
    queryKey: ["lcdQueryClient", resolvedRestEndpoint],
    queryFn: () =>
      createLcdQueryClient({
        restEndpoint: resolvedRestEndpoint || "",
      }),
    enabled: !!resolvedRestEndpoint,
    staleTime: Infinity,
  });

  return {
    lcdQueryClient: lcdQueryClient.data,
  };
};
