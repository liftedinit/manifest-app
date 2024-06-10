import "../styles/globals.css";
import "@interchain-ui/react/styles";
import "@fontsource/rubik";

import type { AppProps } from "next/app";

import { SignData } from "@cosmos-kit/web3auth";
import { makeWeb3AuthWallets } from "@cosmos-kit/web3auth/esm/index";
import { useMemo, useState } from "react";
import SignModal from "@/components/groups/modals/authSignerModal";
import { SignerOptions, wallets } from "cosmos-kit";
import { ChainProvider } from "@cosmos-kit/react";
import { Registry } from "@cosmjs/proto-signing";
import { TailwindModal } from "@/components";
import { ThemeProvider } from "@/contexts/theme";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import SideNav from "../components/react/sideNav";
import { AssetList, Chain } from "@chain-registry/types";
import { SigningStargateClientOptions, AminoTypes } from "@cosmjs/stargate";
import {
  cosmosAminoConverters,
  manifestAminoConverters,
  cosmosProtoRegistry,
  manifestProtoRegistry,
} from "@chalabi/manifestjs";
import MobileNav from "@/components/react/mobileNav";
import {
  defaultChain,
  defaultAssets,
  chainEndpoints,
} from "@/config";
import {web3AuthClientConfig, web3AuthLoginMethods} from "@/config/web3auth";

const manifestChain: Chain = defaultChain
const manifestAssets: AssetList = defaultAssets;

function ManifestApp({ Component, pageProps }: AppProps) {
  const signerOptions: SignerOptions = {
    signingStargate: (
      _chain: string | Chain
    ): SigningStargateClientOptions | undefined => {
      const mergedRegistry = new Registry([
        ...manifestProtoRegistry,
        ...cosmosProtoRegistry,
      ]);
      const mergedAminoTypes = new AminoTypes({
        ...cosmosAminoConverters,
        ...manifestAminoConverters,
      });
      return {
        aminoTypes: mergedAminoTypes,
        // @ts-ignore
        registry: mergedRegistry,
      };
    },
  };

  const client = new QueryClient();

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
        loginMethods: web3AuthLoginMethods,
        client: web3AuthClientConfig,

        promptSign: async (_, signData) =>
          new Promise((resolve) =>
            setWeb3AuthPrompt({
              signData,
              resolve: (approved) => {
                setWeb3AuthPrompt(undefined);
                resolve(approved);
              },
            })
          ),
      }),
    []
  );

  const combinedWallets = [...web3AuthWallets, ...wallets];

  return (
    <QueryClientProvider client={client}>
      <ReactQueryDevtools />
      <ChainProvider
        chains={[manifestChain]}
        assetLists={[manifestAssets]}
        wallets={combinedWallets}
        logLevel="NONE"
        endpointOptions={{
          isLazy: true,
          endpoints: {
            manifest: chainEndpoints,
          },
        }}
        walletConnectOptions={{
          signClient: {
            projectId: "a8510432ebb71e6948cfd6cde54b70f7",
            relayUrl: "wss://relay.walletconnect.org",
            metadata: {
              name: "CosmosKit Template",
              description: "CosmosKit dapp template",
              url: "https://docs.cosmology.zone/cosmos-kit/",
              icons: [],
            },
          },
        }}
        signerOptions={signerOptions}
        walletModal={TailwindModal}
      >
        <ThemeProvider>
          <SideNav />
          <MobileNav />
          <div className="min-h-screen max-w-screen md:ml-20 sm:px-4 sm:py-2 bg-base-200 ">
            <Component {...pageProps} />
            <SignModal
              visible={web3AuthPrompt !== undefined}
              onClose={() => web3AuthPrompt?.resolve(false)}
              data={{}}
              approve={() => web3AuthPrompt?.resolve(true)}
              reject={() => web3AuthPrompt?.resolve(false)}
            />
          </div>
        </ThemeProvider>
      </ChainProvider>
    </QueryClientProvider>
  );
}

export default ManifestApp;
