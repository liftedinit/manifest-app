import { WidgetProps } from '@skip-go/widget';
import { useEffect, useState } from 'react';

// Define the interface for send modal URL parameters
export interface SendModalUrlParams {
  form?: 'send' | 'ibc'; // Type of form to show
  token?: string; // Token to pre-select
}

// Hook to get and set send modal parameters from/to URL
export const useSendModalParams = (): [
  SendModalUrlParams,
  (params: SendModalUrlParams) => void,
] => {
  const [params, setParams] = useState<SendModalUrlParams>({});

  // Read URL parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const form = urlParams.get('form');
      const token = urlParams.get('token');

      const newParams: SendModalUrlParams = {};
      if (form === 'send' || form === 'ibc') newParams.form = form;
      if (token) newParams.token = token;

      setParams(newParams);
    }
  }, []);

  // Function to update URL with new parameters
  const updateParams = (newParams: SendModalUrlParams) => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);

      // Update or remove form parameter
      if (newParams.form) {
        urlParams.set('form', newParams.form);
      } else {
        urlParams.delete('form');
      }

      // Update or remove token parameter
      if (newParams.token) {
        urlParams.set('token', newParams.token);
      } else {
        urlParams.delete('token');
      }

      // Update URL
      const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
      window.history.replaceState({}, '', newUrl);

      // Update state
      setParams(newParams);
    }
  };

  return [params, updateParams];
};

export const useQueryParams = (
  srcAsset?: string,
  srcChain?: string,
  destChain?: string,
  destAsset?: string,
  amountIn?: number,
  amountOut?: number,
  additionalProps?: Partial<WidgetProps['defaultRoute']>
) => {
  const [params, setParams] = useState<WidgetProps['defaultRoute']>(undefined);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryString = window.location.search.substring(1);
      const pairs = queryString.split('&');
      const keys = [
        'src_asset',
        'src_chain',
        'dest_chain',
        'dest_asset',
        'amount_in',
        'amount_out',
      ];
      const result: Partial<WidgetProps['defaultRoute']> = {};

      // Add any additional properties passed as arguments
      if (srcAsset) result.srcAssetDenom = srcAsset;
      if (srcChain) result.srcChainId = srcChain;
      if (destChain) result.destChainId = destChain;
      if (destAsset) result.destAssetDenom = destAsset;
      if (amountIn !== undefined) result.amountIn = amountIn;
      if (amountOut !== undefined) result.amountOut = amountOut;

      // Process URL query parameters
      pairs.forEach(pair => {
        const [rawKey, rawValue] = pair.split('=');
        if (rawKey && rawValue && keys.includes(rawKey)) {
          if (rawKey === 'src_asset') {
            result.srcAssetDenom = decodeURIComponent(rawValue);
          }
          if (rawKey === 'src_chain') {
            result.srcChainId = decodeURIComponent(rawValue);
          }
          if (rawKey === 'dest_chain') {
            result.destChainId = decodeURIComponent(rawValue);
          }
          if (rawKey === 'dest_asset') {
            result.destAssetDenom = decodeURIComponent(rawValue);
          }
          if (rawKey === 'amount_in') {
            result.amountIn = parseFloat(decodeURIComponent(rawValue));
          }
          if (rawKey === 'amount_out') {
            result.amountOut = parseFloat(decodeURIComponent(rawValue));
          }
        }
      });

      // Merge any additional properties
      if (additionalProps) {
        Object.assign(result, additionalProps);
      }

      // Only set params if we have at least one property
      if (Object.keys(result).length > 0) {
        setParams(result as WidgetProps['defaultRoute']);
      } else {
        setParams(undefined);
      }
    }
  }, [srcAsset, srcChain, destChain, destAsset, amountIn, amountOut, additionalProps]);

  return params;
};

// Add a new hook to update URL with route parameters
export const useUpdateUrlWithRoute = (route: WidgetProps['defaultRoute']) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (route) {
        const params = new URLSearchParams();

        if (route.srcAssetDenom) params.set('src_asset', route.srcAssetDenom);
        if (route.srcChainId) params.set('src_chain', route.srcChainId);
        if (route.destChainId) params.set('dest_chain', route.destChainId);
        if (route.destAssetDenom) params.set('dest_asset', route.destAssetDenom);
        if (route.amountIn !== undefined) params.set('amount_in', route.amountIn.toString());
        if (route.amountOut !== undefined) params.set('amount_out', route.amountOut.toString());

        // Only update URL if we have at least one parameter
        if ([...params.entries()].length > 0) {
          // Update URL without refreshing the page
          const newUrl = `${window.location.pathname}?${params.toString()}`;
          window.history.replaceState({}, '', newUrl);
        }
      }

      // Return cleanup function to clear URL parameters when component unmounts
      return () => {
        // Only clear IBC-related parameters, not other URL parameters
        const currentParams = new URLSearchParams(window.location.search);
        const ibcParams = [
          'src_asset',
          'src_chain',
          'dest_chain',
          'dest_asset',
          'amount_in',
          'amount_out',
        ];

        let hasIbcParams = false;
        ibcParams.forEach(param => {
          if (currentParams.has(param)) {
            hasIbcParams = true;
            currentParams.delete(param);
          }
        });

        if (hasIbcParams) {
          // If there are remaining parameters, update URL with them
          const newSearch = currentParams.toString();
          const newUrl = newSearch
            ? `${window.location.pathname}?${newSearch}`
            : window.location.pathname;

          window.history.replaceState({}, '', newUrl);
        }
      };
    }
  }, [route]);
};
