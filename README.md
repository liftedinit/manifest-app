# Manifest App

This is a web app that allows users to interact with the Manifest Network and its various modules.

For more information on the Manifest Network and its modules, please visit the [Manifest Network GitHub](https://github.com/liftedinit/manifest-ledger).

[![codecov](https://codecov.io/gh/liftedinit/manifest-app/branch/main/graph/badge.svg)](https://codecov.io/gh/liftedinit/manifest-app)

## Getting Started

### Installation

1. Clone the repository

   - `git clone hptts://github.com/liftedinit/manifest-app`
   - `cd manifest-app`

2. Install dependencies
   - `bun install`

### .env

```
NEXT_PUBLIC_WALLETCONNECT_KEY=
NEXT_PUBLIC_WEB3AUTH_NETWORK=
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=
NEXT_PUBLIC_CHAIN=manifest
NEXT_PUBLIC_CHAIN_ID=manifest-1
NEXT_PUBLIC_TESTNET_CHAIN_ID=manifest-ledger-beta
NEXT_PUBLIC_MAINNET_RPC_URL=https://nodes.chandrastation.com/rpc/manifest/
NEXT_PUBLIC_TESTNET_RPC_URL=https://manifest-beta-rpc.liftedinit.tech/
NEXT_PUBLIC_MAINNET_API_URL=https://nodes.chandrastation.com/api/manifest/
NEXT_PUBLIC_TESTNET_API_URL=https://manifest-beta-rest.liftedinit.tech/
NEXT_PUBLIC_TESTNET_EXPLORER_URL=https://testnet.manifest.explorers.guru
NEXT_PUBLIC_MAINNET_EXPLORER_URL=https://manifest.explorers.guru
NEXT_PUBLIC_TESTNET_INDEXER_URL=https://testnet-indexer.liftedinit.tech
NEXT_PUBLIC_MAINNET_INDEXER_URL=https://indexer.liftedinit.app
```

### Development

1. Start the server

   - `bun run dev`

2. Navigate to `http://localhost:3000` in your browser

### Production

1. Build the app

   - `bun run build`

2. Start the server

   - `bun run start`

3. Navigate to `http://localhost:3000` in your browser
