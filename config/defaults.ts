import { AssetList, Chain } from "@chain-registry/types";
export const chainName = process.env.NEXT_PUBLIC_CHAIN ?? 'manifest';;
const mainNetRPC = process.env.NEXT_PUBLIC_MAINNET_RPC ?? 'https://nodes.chandrastation.com/rpc/manifest/';
const mainNetAPI = process.env.NEXT_PUBLIC_MAINNET_API ?? 'https://nodes.chandrastation.com/api/manifest/';
const testNetRPC = process.env.NEXT_PUBLIC_TESTNET_RPC ?? 'https://manifest-beta-rpc.liftedinit.tech/ ';
const testNetAPI = process.env.NEXT_PUBLIC_TESTNET_API ?? 'https://manifest-beta-rest.liftedinit.tech/ ';

export const manifestChain: Chain = {
    chain_name: "manifest",
    status: "live",
    network_type: "testnet",
    website: "",
    pretty_name: "Manifest Testnet",
    chain_id: process.env.NEXT_PUBLIC_CHAIN_ID ?? "manifest-1",
    bech32_prefix: "manifest",
    daemon_name: "manifest",
    node_home: "$HOME/.manifest",
    slip44: 118,
    apis: {
      rpc: [
        {
          address: mainNetRPC,
          provider: undefined,
          archive: undefined,
        },
      ],
      rest: [
        {
          address: mainNetAPI,
          provider: undefined,
          archive: undefined,
        },
      ],
    },
    fees: {
      fee_tokens: [
        {
          denom: "umfx",
          fixed_min_gas_price: 0.001,
          low_gas_price: 0.001,
          average_gas_price: 0.001,
          high_gas_price: 0.001,
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
export const manifestAssets: AssetList = {
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

  export const manifestTestnetChain: Chain = {
    chain_name: "manifest",
    status: "live",
    network_type: "testnet",
    website: "",
    pretty_name: "Manifest Testnet",
    chain_id: process.env.NEXT_PUBLIC_TESTNET_CHAIN_ID ?? "manifest-ledger-beta",
    bech32_prefix: "manifest",
    daemon_name: "manifest",
    node_home: "$HOME/.manifest",
    slip44: 118,
    apis: {
      rpc: [
        {
          address: testNetRPC,
          provider: undefined,
          archive: undefined,
        },
      ],
      rest: [
        {
          address: testNetAPI,
          provider: undefined,
          archive: undefined,
        },
      ],
    },
    fees: {
      fee_tokens: [
        {
          denom: "umfx",
          fixed_min_gas_price: 0.001,
          low_gas_price: 0.004,
          average_gas_price: 0.008,
          high_gas_price: 0.01,
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
export const manifestTestnetAssets: AssetList = {
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