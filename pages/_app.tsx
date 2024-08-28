import "../styles/globals.css";
import "@interchain-ui/react/styles";
import "@fontsource/rubik";

import type { AppProps } from "next/app";
import { createPortal } from "react-dom";
import { SignData } from "@cosmos-kit/web3auth";
import { makeWeb3AuthWallets } from "@cosmos-kit/web3auth/esm/index";
import { useEffect, useMemo, useRef, useState } from "react";
import SignModal from "@/components/react/authSignerModal";
import {
  manifestAssets,
  manifestChain,
  manifestTestnetChain,
  manifestTestnetAssets,
} from "@/config";
import { SignerOptions, wallets } from "cosmos-kit";
import { ChainProvider } from "@cosmos-kit/react";
import { Registry } from "@cosmjs/proto-signing";
import { TailwindModal } from "../components";
import { ThemeProvider } from "../contexts/theme";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import SideNav from "../components/react/sideNav";
import { Chain } from "@chain-registry/types";
import { SigningStargateClientOptions, AminoTypes } from "@cosmjs/stargate";
import {
  manifestAminoConverters,
  manifestProtoRegistry,
  osmosisAminoConverters,
  osmosisProtoRegistry,
  cosmosAminoConverters,
  cosmosProtoRegistry,
} from "@chalabi/manifestjs";
import { AdvancedModeProvider, ToastProvider } from "@/contexts";

import MobileNav from "@/components/react/mobileNav";
import { DynamicEndpointSelector } from "@/components/react/endpointSelector";

import { useEndpointStore } from "@/store/endpointStore";

// websocket stuff might delete
// import * as Ably from "ably";
// import { AblyProvider, useChannel, usePresence } from "ably/react";

// const ablyClient = new Ably.Realtime({
//   key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
// });

type ManifestAppProps = AppProps & {
  Component: AppProps["Component"];
  pageProps: AppProps["pageProps"];
};

function ManifestApp({ Component, pageProps }: ManifestAppProps) {
  // signer options to support amino signing for all the different modules we use
  const signerOptions: SignerOptions = {
    signingStargate: (
      _chain: string | Chain,
    ): SigningStargateClientOptions | undefined => {
      const mergedRegistry = new Registry([
        ...manifestProtoRegistry,
        ...cosmosProtoRegistry,
        ...osmosisProtoRegistry,
      ]);
      const mergedAminoTypes = new AminoTypes({
        ...cosmosAminoConverters,
        ...manifestAminoConverters,
        ...osmosisAminoConverters,
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
  const previousEndpointRef = useRef<typeof selectedEndpoint | undefined>(
    undefined,
  );

  useEffect(() => {
    if (
      previousEndpointRef.current &&
      previousEndpointRef.current !== selectedEndpoint
    ) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setEndpointKey((prev) => prev + 1);
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
            provider: "google",
            name: "Google",
            logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
          },
          {
            provider: "twitter",
            name: "Twitter",
            logo: "https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023_%28white%29.png",
          },
          {
            provider: "github",
            name: "GitHub",
            logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Github_logo_svg.svg",
          },
          {
            provider: "apple",
            name: "Apple",
            logo: "/appleBlack.svg",
          },
          {
            provider: "discord",
            name: "Discord",
            logo: "https://assets-global.website-files.com/6257adef93867e50d84d30e2/653714c174fc6c8bbea73caf_636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.svg",
          },
        ],

        client: {
          clientId: process.env.NEXT_PUBLIC_WEB3_CLIENT_ID ?? "",
          web3AuthNetwork: "testnet",
        },

        promptSign: async (_, signData) =>
          new Promise((resolve) =>
            setWeb3AuthPrompt({
              signData,
              resolve: (approved) => {
                setWeb3AuthPrompt(undefined);
                resolve(approved);
              },
            }),
          ),
      }),
    [],
  );

  // combine the web3auth wallets with the other wallets
  const combinedWallets = [...web3AuthWallets, ...wallets];

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
          rpc: [
            selectedEndpoint?.rpc ??
              "https://nodes.chandrastation.com/rpc/manifest/",
          ],
          rest: [
            selectedEndpoint?.api ??
              "https://nodes.chandrastation.com/api/manifest/",
          ],
        },
      },
    }),
    [selectedEndpoint],
  );

  return (
    // <AblyProvider client={ablyClient}>

    <QueryClientProvider client={client}>
      <ReactQueryDevtools />
      {isLoading ? (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-base-200 bg-opacity-75 z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-xl font-semibold">Swapping endpoints...</p>
        </div>
      ) : (
        <ChainProvider
          key={endpointKey}
          chains={
            selectedEndpoint?.network === "testnet"
              ? [manifestTestnetChain]
              : [manifestChain]
          }
          assetLists={
            selectedEndpoint?.network === "testnet"
              ? [manifestTestnetAssets]
              : [manifestAssets]
          }
          // @ts-ignore
          wallets={combinedWallets}
          logLevel="NONE"
          endpointOptions={endpointOptions}
          walletConnectOptions={{
            signClient: {
              projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_KEY ?? "",
              relayUrl: "wss://relay.walletconnect.org",
              metadata: {
                name: "Alberto",
                description: "Manifest Network Web App",
                url: "https://alberto.com",
                icons: [],
              },
            },
          }}
          signerOptions={signerOptions}
          // @ts-ignore
          walletModal={TailwindModal}
        >
          <ThemeProvider>
            <ToastProvider>
              <AdvancedModeProvider>
                <SideNav />
                <MobileNav />
                <div className="relative min-h-screen max-w-screen md:ml-20 sm:px-4 sm:py-2 bg-base-200 ">
                  <DynamicEndpointSelector />
                  <Component {...pageProps} />
                </div>

                {/* this is for the web3auth signing modal */}
                {isBrowser &&
                  createPortal(
                    <SignModal
                      visible={web3AuthPrompt !== undefined}
                      onClose={() => web3AuthPrompt?.resolve(false)}
                      data={web3AuthPrompt?.signData ?? ({} as SignData)}
                      approve={() => web3AuthPrompt?.resolve(true)}
                      reject={() => web3AuthPrompt?.resolve(false)}
                    />,
                    document.body,
                  )}
              </AdvancedModeProvider>
            </ToastProvider>
          </ThemeProvider>
        </ChainProvider>
      )}
    </QueryClientProvider>

    // </AblyProvider>
  );
}

export default ManifestApp;
