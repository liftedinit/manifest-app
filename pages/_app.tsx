import "../styles/globals.css";
import "@interchain-ui/react/styles";

import type { AppProps } from "next/app";

import { SignerOptions, wallets } from "cosmos-kit";
import { ChainProvider } from "@cosmos-kit/react";
import { chains } from "chain-registry";

import { TailwindModal } from "../components";
import { ThemeProvider } from "../contexts/theme";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import SideNav from "../components/react/sideNav";
import { AssetList } from "@chain-registry/types";

const assets: AssetList[] = [];

function Template({ Component, pageProps }: AppProps) {
  const signerOptions: SignerOptions = {
    // signingStargate: () => {
    //   return getSigningCosmosClientOptions();
    // }
  };

  const client = new QueryClient();

  return (
    <ChainProvider
      chains={chains}
      assetLists={assets}
      wallets={wallets}
      logLevel="NONE"
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
        <QueryClientProvider client={client}>
          <ReactQueryDevtools initialIsOpen={false} />
          <SideNav />
          <div className="min-h-screen text-black bg-light-bg-400 dark:bg-dark-bg-400 dark:text-white max-w-screen  ml-20 ">
            <Component {...pageProps} />
          </div>
        </QueryClientProvider>
      </ThemeProvider>
    </ChainProvider>
  );
}

export default Template;
