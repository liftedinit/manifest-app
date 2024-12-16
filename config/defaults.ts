import { AssetList, Chain } from '@chain-registry/types';
import env from './env';

export const manifestChain: Chain = {
  chain_name: 'manifest',
  status: 'live',
  network_type: env.chainTier,
  website: '',
  pretty_name: 'Manifest Testnet',
  chain_id: env.chainId,
  bech32_prefix: 'manifest',
  daemon_name: 'manifest',
  node_home: '$HOME/.manifest',
  slip44: 118,
  apis: {
    rpc: [
      {
        address: env.rpcUrl,
      },
    ],
    rest: [
      {
        address: env.apiUrl,
      },
    ],
  },
  fees: {
    fee_tokens: [
      {
        denom: 'umfx',
        fixed_min_gas_price: 0.02,
        low_gas_price: 0.01,
        average_gas_price: 0.022,
        high_gas_price: 0.034,
      },
    ],
  },
  staking: {
    staking_tokens: [
      {
        denom: 'upoa',
      },
    ],
  },
  codebase: {
    git_repo: 'github.com/liftedinit/manifest-ledger',
    recommended_version: 'v0.0.1-alpha.4',
    compatible_versions: ['v0.0.1-alpha.4'],
    binaries: {
      'linux/amd64':
        'https://github.com/liftedinit/manifest-ledger/releases/download/v0.0.1-alpha.4/manifest-ledger_0.0.1-alpha.4_linux_amd64.tar.gz',
    },
    versions: [
      {
        name: 'v1',
        recommended_version: 'v0.0.1-alpha.4',
        compatible_versions: ['v0.0.1-alpha.4'],
      },
    ],
    genesis: {
      genesis_url:
        'https://github.com/liftedinit/manifest-ledger/blob/main/network/manifest-1/manifest-1_genesis.json',
    },
  },
};
export const manifestAssets: AssetList = {
  chain_name: 'manifest',
  assets: [
    {
      description: 'Manifest testnet native token',
      denom_units: [
        {
          denom: 'umfx',
          exponent: 0,
        },
        {
          denom: 'mfx',
          exponent: 6,
        },
      ],
      base: 'umfx',
      name: 'Manifest Testnet Token',
      display: 'mfx',
      symbol: 'MFX',
    },
    {
      description: 'Proof of Authority token for the Manifest testnet',
      denom_units: [
        {
          denom: 'upoa',
          exponent: 0,
        },
        {
          denom: 'poa',
          exponent: 6,
        },
      ],
      base: 'upoa',
      name: 'Manifest Testnet Token',
      display: 'poa',
      symbol: 'POA',
    },
  ],
};
