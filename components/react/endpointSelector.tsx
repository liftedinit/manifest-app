import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Formik, Form } from 'formik';
import dynamic from 'next/dynamic';

import { useToast } from '@/contexts';
import { useEndpointStore } from '@/store/endpointStore';
import { TextInput } from './inputs';
import Yup from '@/utils/yupExtensions';

export interface Endpoint {
  rpc: string;
  api: string;
  provider: string;
  isHealthy: boolean;
  network: 'mainnet' | 'testnet';
  custom: boolean;
}

const validateRPCEndpoint = async (url: string) => {
  console.log('Validating RPC endpoint:', url);
  if (!url) return false;
  try {
    const endpoint = url.startsWith('http') ? url : `https://${url}`;
    console.log('Making RPC request to:', endpoint);

    const response = await fetch(endpoint, {
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

    console.log('RPC Response status:', response.status);
    if (!response.ok) {
      console.log('RPC Response not ok');
      return false;
    }

    const data = await response.json();
    console.log('RPC Response data:', data);

    return data?.result?.sync_info?.catching_up === false;
  } catch (error) {
    console.error('RPC Validation error:', error);
    return false;
  }
};

const validateAPIEndpoint = async (url: string) => {
  console.log('Validating API endpoint:', url);
  if (!url) return false;
  try {
    const endpoint = url.startsWith('http') ? url : `https://${url}`;
    const baseUrl = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
    const apiUrl = `${baseUrl}/cosmos/base/tendermint/v1beta1/syncing`;

    console.log('Making API request to:', apiUrl);

    const response = await fetch(apiUrl);
    console.log('API Response status:', response.status);

    if (!response.ok) {
      console.log('API Response not ok');
      return false;
    }

    return response.ok;
  } catch (error) {
    console.error('API Validation error:', error);
    return false;
  }
};

const validateIndexerEndpoint = async (url: string) => {
  console.log('Validating Indexer endpoint:', url);
  if (!url) return false;
  try {
    const endpoint = url.startsWith('http') ? url : `https://${url}`;
    const baseUrl = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
    const indexerUrl = `${baseUrl}`;

    console.log('Making Indexer request to:', indexerUrl);

    const response = await fetch(indexerUrl);
    console.log('Indexer Response status:', response.status);

    if (!response.ok) {
      console.log('Indexer Response not ok');
      return false;
    }

    return response.ok;
  } catch (error) {
    console.error('Indexer Validation error:', error);
    return false;
  }
};

const validateExplorerEndpoint = async (url: string) => {
  console.log('Validating Explorer endpoint:', url);
  if (!url) return false;
  try {
    // const endpoint = url.startsWith('http') ? url : `https://${url}`;
    // const baseUrl = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
    // const explorerUrl = `${baseUrl}`;

    // console.log('Making Explorer request to:', explorerUrl);
    //
    // const response = await fetch(explorerUrl);
    // console.log('Explorer Response status:', response.status);
    //
    // if (!response.ok) {
    //   console.log('Explorer Response not ok');
    //   return false;
    // }
    //
    // return response.ok;
    return true;
  } catch (error) {
    console.error('Explorer Validation error:', error);
    return false;
  }
};

const EndpointSchema = Yup.object().shape({
  rpc: Yup.string().required('RPC endpoint is required').test({
    name: 'rpc-validation',
    message: 'RPC endpoint is not responding',
    test: validateRPCEndpoint,
  }),
  api: Yup.string().required('API endpoint is required').test({
    name: 'api-validation',
    message: 'API endpoint is not responding',
    test: validateAPIEndpoint,
  }),
  indexer: Yup.string().required('Indexer endpoint is required').test({
    name: 'indexer-validation',
    message: 'Indexer endpoint is not responding',
    test: validateIndexerEndpoint,
  }),
  explorer: Yup.string().required('Explorer endpoint is required').test({
    name: 'explorer-validation',
    message: 'Explorer endpoint is not responding',
    test: validateExplorerEndpoint,
  }),
});

function SSREndpointSelector() {
  const {
    endpoints,
    selectedEndpointKey,
    setSelectedEndpointKey,
    addEndpoint,
    removeEndpoint,
    updateEndpointHealth,
  } = useEndpointStore(state => ({
    endpoints: state.endpoints,
    selectedEndpointKey: state.selectedEndpointKey,
    setSelectedEndpointKey: state.setSelectedEndpointKey,
    addEndpoint: state.addEndpoint,
    removeEndpoint: state.removeEndpoint,
    updateEndpointHealth: state.updateEndpointHealth,
  }));

  const { setToastMessage } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [endpointToRemove, setEndpointToRemove] = useState<string | null>(null);

  const { isLoading, error } = useQuery({
    queryKey: ['checkEndpoints', endpoints],
    queryFn: updateEndpointHealth,
    refetchInterval: 30000,
    enabled: true,
  });

  const handleCustomEndpointSubmit = async (values: {
    rpc: string;
    api: string;
    indexer: string;
    explorer: string;
  }) => {
    const rpcUrl = values.rpc.startsWith('http') ? values.rpc : `https://${values.rpc}`;
    const apiUrl = values.api.startsWith('http') ? values.api : `https://${values.api}`;
    const indexerUrl = values.indexer.startsWith('http')
      ? values.indexer
      : `https://${values.indexer}`;
    const explorerUrl = values.explorer.startsWith('http')
      ? values.explorer
      : `https://${values.explorer}`;

    try {
      const [isRPCValid, isAPIValid] = await Promise.all([
        validateRPCEndpoint(rpcUrl),
        validateAPIEndpoint(apiUrl),
      ]);

      if (!isRPCValid || !isAPIValid) {
        throw new Error('Endpoint validation failed');
      }

      await addEndpoint(rpcUrl, apiUrl, indexerUrl, explorerUrl);
      setToastMessage({
        type: 'alert-success',
        title: 'Custom endpoint added',
        description: 'The new endpoint has been successfully added.',
        bgColor: '#2ecc71',
      });
    } catch (error) {
      console.error('Error adding custom endpoint:', error);
      let errorMessage = 'An unknown error occurred while adding the endpoint.';

      if (error instanceof Error) {
        if (error.message.includes('Invalid URL')) {
          errorMessage = 'Invalid URL format. Please check all URLs.';
        } else if (error.message.includes('Network error')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('Timeout')) {
          errorMessage = 'Connection timeout. The endpoint might be unreachable.';
        } else {
          errorMessage = error.message;
        }
      }

      setToastMessage({
        type: 'alert-error',
        title: 'Error adding custom endpoint',
        description: errorMessage,
        bgColor: '#e74c3c',
      });
      throw error;
    }
  };

  const truncateUrl = (url: string) => {
    try {
      const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?$/;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = ipRegex.test(url) ? `http://${url}` : `https://${url}`;
      }
      const parsedUrl = new URL(url);
      return `${parsedUrl.host}`;
    } catch (error) {
      console.error('Invalid URL:', url);
      return url;
    }
  };

  const isCustomEndpoint = (endpoint: Endpoint) => endpoint.custom;

  return (
    <dialog id="endpoint_selector_modal" className="modal">
      <div className="modal-box w-full max-w-2xl bg-[#FFFFFF] dark:bg-[#1D192D]">
        <h3 className="mb-4 text-xl font-extrabold tracking-tight sm:mb-6 leading-tight border-b-[0.5px] dark:text-[#FFFFFF99] dark:border-[#FFFFFF99] border-b-[black] pb-4">
          Available Endpoints
        </h3>

        <div className="dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC] p-[24px] rounded-[24px] mb-4">
          {isLoading ? (
            <p>Checking endpoints...</p>
          ) : error ? (
            <p>Error checking endpoints</p>
          ) : (
            <ul className="space-y-4">
              {endpoints.map((endpoint: Endpoint, index: number) => (
                <li
                  key={index}
                  className={`
                    flex flex-col p-3 rounded-lg cursor-pointer border
                    ${
                      selectedEndpointKey === endpoint.provider
                        ? 'dark:bg-[#FFFFFF14] bg-[#00000008] dark:border-[#FFFFFF30] border-[#00000030]'
                        : 'dark:border-[#FFFFFF10] border-[#00000015] hover:dark:bg-[#FFFFFF08] hover:bg-[#00000005]'
                    }
                    transition-all duration-200 group
                  `}
                  onClick={() => setSelectedEndpointKey(endpoint.provider)}
                >
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full transition-all duration-300
                            ${
                              endpoint.isHealthy
                                ? 'bg-success shadow-sm shadow-success/30'
                                : 'bg-error shadow-sm shadow-error/30'
                            }
                          `}
                        ></div>
                        <p className="text-base font-medium truncate">
                          {endpoint.custom ? `Custom (${endpoint.network})` : endpoint.provider}
                        </p>
                      </div>
                      <p className="text-sm opacity-60 mt-1 truncate">
                        {truncateUrl(endpoint.rpc)}
                      </p>
                    </div>

                    {isCustomEndpoint(endpoint) && (
                      <button
                        className={`
                          btn btn-sm btn-ghost opacity-0 group-hover:opacity-100
                          hover:bg-error/10 hover:text-error
                          transition-all duration-200
                          ${endpointToRemove === endpoint.provider ? 'opacity-100 rotate-90' : ''}
                        `}
                        onClick={e => {
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
                              d="M6 12h12"
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
        </div>

        <button
          className="btn btn-gradient text-white w-full"
          onClick={e => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
        >
          Add Custom Endpoints
        </button>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>

      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box w-full bg-[#FFFFFF] dark:bg-[#1D192D] max-w-2xl">
            <h3 className="mb-4 text-xl font-extrabold tracking-tight sm:mb-6 leading-tight border-b-[0.5px] dark:text-[#FFFFFF99] dark:border-[#FFFFFF99] border-b-[black] pb-4">
              Add Custom Endpoint
            </h3>

            <div className="dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC] p-6 rounded-2xl">
              <Formik
                initialValues={{ rpc: '', api: '', indexer: '', explorer: '' }}
                validationSchema={EndpointSchema}
                onSubmit={async (values, { setSubmitting, resetForm }) => {
                  try {
                    await handleCustomEndpointSubmit(values);
                    resetForm();
                    setIsModalOpen(false);
                  } catch (error) {
                    console.error(error);
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ isSubmitting, isValid }) => (
                  <Form className="flex flex-col gap-6">
                    <div className="form-control">
                      <label className="text-sm font-medium mb-2 dark:text-[#FFFFFF99] text-[#000000CC]">
                        RPC Endpoint
                      </label>
                      <div className="relative">
                        <TextInput
                          name="rpc"
                          placeholder="Enter RPC URL"
                          className="w-full px-4 py-3 bg-transparent 
                            dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC]
                            border dark:border-[#FFFFFF20] border-[#00000020]
                            dark:focus:border-[#FFFFFF40] focus:border-[#00000040]
                            rounded-xl transition-all duration-200
                            dark:text-[#FFFFFF99] text-[#000000CC]
                            placeholder:dark:text-[#FFFFFF60] placeholder:text-[#00000060]"
                        />
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="text-sm font-medium mb-2 dark:text-[#FFFFFF99] text-[#000000CC]">
                        API Endpoint
                      </label>
                      <div className="relative">
                        <TextInput
                          name="api"
                          placeholder="Enter API URL"
                          className="w-full px-4 py-3 bg-transparent 
                            dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC]
                            border dark:border-[#FFFFFF20] border-[#00000020]
                            dark:focus:border-[#FFFFFF40] focus:border-[#00000040]
                            rounded-xl transition-all duration-200
                            dark:text-[#FFFFFF99] text-[#000000CC]
                            placeholder:dark:text-[#FFFFFF60] placeholder:text-[#00000060]"
                        />
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="text-sm font-medium mb-2 dark:text-[#FFFFFF99] text-[#000000CC]">
                        Indexer Endpoint
                      </label>
                      <div className="relative">
                        <TextInput
                          name="indexer"
                          placeholder="Enter indexer URL"
                          className="w-full px-4 py-3 bg-transparent
                            dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC]
                            border dark:border-[#FFFFFF20] border-[#00000020]
                            dark:focus:border-[#FFFFFF40] focus:border-[#00000040]
                            rounded-xl transition-all duration-200
                            dark:text-[#FFFFFF99] text-[#000000CC]
                            placeholder:dark:text-[#FFFFFF60] placeholder:text-[#00000060]"
                        />
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="text-sm font-medium mb-2 dark:text-[#FFFFFF99] text-[#000000CC]">
                        Explorer Endpoint
                      </label>
                      <div className="relative">
                        <TextInput
                          name="explorer"
                          placeholder="Enter explorer URL"
                          className="w-full px-4 py-3 bg-transparent
                            dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC]
                            border dark:border-[#FFFFFF20] border-[#00000020]
                            dark:focus:border-[#FFFFFF40] focus:border-[#00000040]
                            rounded-xl transition-all duration-200
                            dark:text-[#FFFFFF99] text-[#000000CC]
                            placeholder:dark:text-[#FFFFFF60] placeholder:text-[#00000060]"
                        />
                      </div>
                    </div>

                    <div className="modal-action flex gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 btn focus:outline-none dark:bg-[#FFFFFF0F] bg-[#0000000A] py-2.5 sm:py-3.5"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !isValid}
                        className="flex-1 btn btn-gradient text-white disabled:text-black 
                          py-2.5 sm:py-3.5 disabled:opacity-50 
                          disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <span className="loading loading-spinner loading-sm"></span>
                            Adding...
                          </span>
                        ) : (
                          'Add Endpoint'
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}

const EndpointSelector = dynamic(() => Promise.resolve(SSREndpointSelector), {
  ssr: false,
});

export default EndpointSelector;
