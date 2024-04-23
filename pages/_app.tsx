import "../styles/globals.css";
import "@interchain-ui/react/styles";
import "@fontsource/rubik";

import type { AppProps } from "next/app";

import { SignerOptions, wallets } from "cosmos-kit";
import { ChainProvider } from "@cosmos-kit/react";
import { Registry } from "@cosmjs/proto-signing";
import { TailwindModal } from "../components";
import { ThemeProvider } from "../contexts/theme";
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

const manifestChain: Chain = {
  chain_name: "manifest",
  status: "live",
  network_type: "testnet",
  website: "https://althea.net/",
  pretty_name: "Manifest Testnet",
  chain_id: "manifest-1",
  bech32_prefix: "manifest",
  daemon_name: "manifest",
  node_home: "$HOME/.manifest",
  slip44: 118,
  apis: {
    rpc: [
      {
        address: "https://nodes.chandrastation.com/rpc/manifest/",
        provider: undefined,
        archive: undefined,
      },
    ],
    rest: [
      {
        address: "https://nodes.chandrastation.com/api/manifest/",
        provider: undefined,
        archive: undefined,
      },
    ],
  },
  fees: {
    fee_tokens: [
      {
        denom: "umfx",
        fixed_min_gas_price: 0.0001,
        low_gas_price: 0.0001,
        average_gas_price: 0.0002,
        high_gas_price: 0.0003,
      },
    ],
  },
  staking: {
    staking_tokens: [
      {
        denom: "upoa",
      },
    ],
  },
  codebase: {
    git_repo: "github.com/liftedinit/manifest-ledger",
    recommended_version: "v0.0.1-alpha.4",
    compatible_versions: ["v0.0.1-alpha.4"],
    binaries: {
      "linux/amd64":
        "https://github.com/liftedinit/manifest-ledger/releases/download/v0.0.1-alpha.4/manifest-ledger_0.0.1-alpha.4_linux_amd64.tar.gz",
    },
    versions: [
      {
        name: "v1",
        recommended_version: "v0.0.1-alpha.4",
        compatible_versions: ["v0.0.1-alpha.4"],
      },
    ],
    genesis: {
      genesis_url:
        "https://github.com/liftedinit/manifest-ledger/blob/main/network/manifest-1/manifest-1_genesis.json",
    },
  },
};
const manifestAssets: AssetList = {
  chain_name: "manifest",
  assets: [
    {
      description: "Manifest testnet native token",
      denom_units: [
        {
          denom: "umfx",
          exponent: 0,
        },
        {
          denom: "mfx",
          exponent: 6,
        },
      ],
      base: "umfx",
      name: "Manifest Testnet Token",
      display: "mfx",
      symbol: "MFX",
    },
    {
      description: "Proof of Authority token for the Manifest testnet",
      denom_units: [
        {
          denom: "upoa",
          exponent: 0,
        },
        {
          denom: "poa",
          exponent: 6,
        },
      ],
      base: "upoa",
      name: "Manifest Testnet Token",
      display: "poa",
      symbol: "POA",
    },
  ],
};

function Template({ Component, pageProps }: AppProps) {
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

  return (
    <ChainProvider
      chains={[manifestChain]}
      assetLists={[manifestAssets]}
      wallets={wallets}
      logLevel="NONE"
      endpointOptions={{
        isLazy: true,
        endpoints: {
          manifest: {
            rpc: ["https://nodes.chandrastation.com/rpc/manifest/"],
            rest: ["https://nodes.chandrastation.com/api/manifest/"],
          },
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
        <QueryClientProvider client={client}>
          <ReactQueryDevtools initialIsOpen={false} />
          <SideNav />
          <div className="min-h-screen   max-w-screen  ml-20 ">
            <Component {...pageProps} />
          </div>
        </QueryClientProvider>
      </ThemeProvider>
    </ChainProvider>
  );
}

export default Template;
