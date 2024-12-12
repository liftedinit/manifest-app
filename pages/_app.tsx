import '../styles/globals.css';
import '@interchain-ui/react/styles';
import '@fontsource/manrope';

import type { AppProps } from 'next/app';
import { createPortal } from 'react-dom';
import { SignData } from '@cosmos-kit/web3auth';
import { makeWeb3AuthWallets } from '@cosmos-kit/web3auth/esm/index';
import { useEffect, useMemo, useRef, useState } from 'react';
import SignModal from '@/components/react/authSignerModal';
import {
  manifestAssets,
  manifestChain,
  manifestTestnetChain,
  manifestTestnetAssets,
} from '@/config';
import { SignerOptions, wallets } from 'cosmos-kit';
import { wallets as cosmosExtensionWallets } from '@cosmos-kit/cosmos-extension-metamask';
import { ChainProvider } from '@cosmos-kit/react';
import { Registry } from '@cosmjs/proto-signing';
import { TailwindModal } from '../components';
import { ThemeProvider } from '../contexts/theme';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import SideNav from '../components/react/sideNav';
import { Chain } from '@chain-registry/types';
import { SigningStargateClientOptions, AminoTypes } from '@cosmjs/stargate';
import {
  strangeloveVenturesAminoConverters,
  strangeloveVenturesProtoRegistry,
  liftedinitAminoConverters,
  liftedinitProtoRegistry,
  osmosisAminoConverters,
  osmosisProtoRegistry,
  cosmosAminoConverters,
  cosmosProtoRegistry,
} from '@liftedinit/manifestjs';
import { ToastProvider, ContactsModalProvider } from '@/contexts';
import { useTheme } from '@/contexts/theme';
import MobileNav from '@/components/react/mobileNav';

import { useEndpointStore } from '@/store/endpointStore';
import EndpointSelector from '@/components/react/endpointSelector';

type ManifestAppProps = AppProps & {
  Component: AppProps['Component'];
  pageProps: AppProps['pageProps'];
};

function ManifestApp({ Component, pageProps }: ManifestAppProps) {
  const { theme } = useTheme();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log({ localStorageTheme: localStorage?.getItem('theme') });
    }
    console.log({ theme });
  }, [theme]);

  const [isDrawerVisible, setDrawerVisible] = useState(() => {
    // Initialize from localStorage if available, otherwise default to true
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('isDrawerVisible');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  // Save to localStorage whenever the state changes
  useEffect(() => {
    localStorage.setItem('isDrawerVisible', JSON.stringify(isDrawerVisible));
  }, [isDrawerVisible]);

  // signer options to support amino signing for all the different modules we use
  const signerOptions: SignerOptions = {
    signingStargate: (_chain: string | Chain): SigningStargateClientOptions | undefined => {
      const mergedRegistry = new Registry([
        ...cosmosProtoRegistry,
        ...osmosisProtoRegistry,
        ...strangeloveVenturesProtoRegistry,
        ...liftedinitProtoRegistry,
      ]);
      const mergedAminoTypes = new AminoTypes({
        ...cosmosAminoConverters,
        ...liftedinitAminoConverters,
        ...osmosisAminoConverters,
        ...strangeloveVenturesAminoConverters,
      });
      return {
        aminoTypes: mergedAminoTypes,
        // @ts-ignore
        registry: mergedRegistry,
      };
    },
  };

  const { selectedEndpoint } = useEndpointStore();
  const [isLoading, setIsLoading] = useState(false);
  const [endpointKey, setEndpointKey] = useState(0);
  const previousEndpointRef = useRef<typeof selectedEndpoint | undefined>(undefined);

  useEffect(() => {
    if (previousEndpointRef.current && previousEndpointRef.current !== selectedEndpoint) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setEndpointKey(prev => prev + 1);
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
    previousEndpointRef.current = selectedEndpoint;
  }, [selectedEndpoint]);

  // tanstack query client
  const client = new QueryClient();
  // web3auth helpers for cosmoskit
  const [web3AuthPrompt, setWeb3AuthPrompt] = useState<
    | {
        signData: SignData;
        resolve: (approved: boolean) => void;
      }
    | undefined
  >();
  const web3AuthWallets = useMemo(
    () =>
      makeWeb3AuthWallets({
        loginMethods: [
          {
            provider: 'google',
            name: 'Google',
            logo: '/google',
          },
          {
            provider: 'twitter',
            name: 'Twitter',
            logo: '/x',
          },
          {
            provider: 'github',
            name: 'GitHub',
            logo: '/github',
          },
          {
            provider: 'apple',
            name: 'Apple',
            logo: '/apple',
          },
          {
            provider: 'discord',
            name: 'Discord',
            logo: '/discord',
          },
          {
            provider: 'reddit',
            name: 'Reddit',
            logo: '/reddit',
          },
          {
            provider: 'email_passwordless',
            name: 'Email',
            logo: '/email',
          },
          {
            provider: 'sms_passwordless',
            name: 'SMS',
            logo: '/sms',
          },
        ],

        client: {
          clientId: process.env.NEXT_PUBLIC_WEB3_CLIENT_ID ?? '',
          web3AuthNetwork: 'testnet',
        },

        promptSign: async (_, signData) =>
          new Promise(resolve =>
            setWeb3AuthPrompt({
              signData,
              resolve: approved => {
                setWeb3AuthPrompt(undefined);
                resolve(approved);
              },
            })
          ),
      }),
    []
  );

  // combine the web3auth wallets with the other wallets
  const combinedWallets = [...web3AuthWallets, ...wallets, ...cosmosExtensionWallets];

  // this is stop ssr errors when we render the web3auth signing modal
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const endpointOptions = useMemo(
    () => ({
      isLazy: true,
      endpoints: {
        manifest: {
          rpc: [selectedEndpoint?.rpc ?? 'https://nodes.liftedinit.tech/manifest/testnet/rpc'],
          rest: [selectedEndpoint?.api ?? 'https://nodes.liftedinit.tech/manifest/testnet/api'],
        },
      },
    }),
    [selectedEndpoint]
  );

  return (
    <ToastProvider>
      <QueryClientProvider client={client}>
        <ReactQueryDevtools />
        {isLoading ? (
          <div className="fixed inset-0 flex flex-col items-center justify-center z-50">
            <div className="loading w-[8rem] loading-ring text-primary mb-4"></div>
            <p className="text-xl font-semibold">Swapping endpoints...</p>
          </div>
        ) : (
          <ChainProvider
            key={endpointKey}
            chains={
              selectedEndpoint?.network === 'testnet' ? [manifestTestnetChain] : [manifestChain]
            }
            assetLists={
              selectedEndpoint?.network === 'testnet' ? [manifestTestnetAssets] : [manifestAssets]
            }
            // @ts-ignore
            wallets={combinedWallets}
            logLevel="NONE"
            endpointOptions={endpointOptions}
            walletConnectOptions={{
              signClient: {
                projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_KEY ?? '',
                relayUrl: 'wss://relay.walletconnect.org',
                metadata: {
                  name: 'Alberto',
                  description: 'Manifest Network Web App',
                  url: 'https://alberto.com',
                  icons: [],
                },
              },
            }}
            signerOptions={signerOptions}
            // @ts-ignore
            walletModal={TailwindModal}
          >
            <ThemeProvider>
              <ContactsModalProvider>
                <div className="flex min-h-screen bg-background-color relative">
                  <div className="hidden md:block">
                    <SideNav
                      isDrawerVisible={isDrawerVisible}
                      setDrawerVisible={setDrawerVisible}
                    />
                  </div>

                  <div
                    className={`flex-1 transition-all duration-300 ease-in-out 
                    ml-0 lg:ml-36 ${isDrawerVisible ? 'lg:ml-[17rem]' : ''} relative z-0`}
                  >
                    <div className="lg:hidden pt-12">
                      <MobileNav />
                    </div>
                    <main className="p-6 relative z-10">
                      <Component {...pageProps} />
                    </main>
                  </div>
                </div>

                <EndpointSelector />

                {/* Web3auth signing modal */}
                {isBrowser &&
                  createPortal(
                    <SignModal
                      visible={web3AuthPrompt !== undefined}
                      onClose={() => web3AuthPrompt?.resolve(false)}
                      data={web3AuthPrompt?.signData ?? ({} as SignData)}
                      approve={() => web3AuthPrompt?.resolve(true)}
                      reject={() => web3AuthPrompt?.resolve(false)}
                    />,
                    document.body
                  )}
              </ContactsModalProvider>
            </ThemeProvider>
          </ChainProvider>
        )}
      </QueryClientProvider>
    </ToastProvider>
  );
}

export default ManifestApp;
