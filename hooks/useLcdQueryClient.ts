import { useState, useEffect } from "react";
import { cosmos } from "@chalabi/manifestjs";
import { useQuery } from "@tanstack/react-query";
import { useChain } from "@cosmos-kit/react";
import { chainName } from "../config";
import { useEndpoint } from "@/contexts/endpointContext";

const createLcdQueryClient = cosmos.ClientFactory.createLCDClient;

export const useLcdQueryClient = () => {
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

  const {selectedEndpoint} = useEndpoint();
  console.log(selectedEndpoint.rpc)
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
