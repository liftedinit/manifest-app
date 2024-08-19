import { useState, useEffect } from "react";
import { cosmos } from "@chalabi/manifestjs";
import { useQuery } from "@tanstack/react-query";
import { useChain } from "@cosmos-kit/react";
import { chainName } from "../config";
import { useEndpointStore } from "@/store/endpointStore";


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

  const {selectedEndpoint} = useEndpointStore();
  console.log(selectedEndpoint)
  const lcdQueryClient = useQuery({
    queryKey: ["lcdQueryClient", selectedEndpoint?.api],
    queryFn: () =>
      createLcdQueryClient({
        restEndpoint: selectedEndpoint?.api || "",
      }),
    enabled: !!resolvedRestEndpoint,
    staleTime: Infinity,
  });

  return {
    lcdQueryClient: lcdQueryClient.data,
  };
};
