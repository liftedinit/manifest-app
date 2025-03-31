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
NEXT_PUBLIC_CHAIN=
NEXT_PUBLIC_CHAIN_ID=
NEXT_PUBLIC_CHAIN_TIER=
NEXT_PUBLIC_RPC_URL=
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_EXPLORER_URL=
NEXT_PUBLIC_INDEXER_URL=
NEXT_PUBLIC_OSMOSIS_CHAIN_ID=
NEXT_PUBLIC_OSMOSIS_RPC_URL=
NEXT_PUBLIC_OSMOSIS_API_URL=
NEXT_PUBLIC_OSMOSIS_EXPLORER_URL=
NEXT_PUBLIC_LEAP_DEEPLINK=
```

where

- `NEXT_PUBLIC_WALLETCONNECT_KEY` is the WalletConnect key
- `NEXT_PUBLIC_WEB3AUTH_NETWORK` is the Web3Auth network to use for social login
- `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID` is the Web3Auth client ID to use for social login
- `NEXT_PUBLIC_CHAIN` is the chain name
- `NEXT_PUBLIC_CHAIN_ID` is the chain ID
- `NEXT_PUBLIC_CHAIN_TIER` is the chain tier (e.g., `testnet`, `mainnet`)
- `NEXT_PUBLIC_RPC_URL` is the chain RPC URL
- `NEXT_PUBLIC_API_URL` is the chain API URL
- `NEXT_PUBLIC_EXPLORER_URL` is the block explorer URL
- `NEXT_PUBLIC_INDEXER_URL` is the YACI indexer URL
- `NEXT_PUBLIC_OSMOSIS_CHAIN_ID` is the osmosis chain ID
- `NEXT_PUBLIC_OSMOSIS_RPC_URL` is the osmosis RPC URL
- `NEXT_PUBLIC_OSMOSIS_API_URL` is the osmosis API URL
- `NEXT_PUBLIC_OSMOSIS_EXPLORER_URL` is the osmosis block explorer URL

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
