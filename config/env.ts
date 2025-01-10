const env = {
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID ?? '',
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ?? '',
  explorerUrl: process.env.NEXT_PUBLIC_EXPLORER_URL ?? '',
  web3AuthClientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID ?? '',
  walletConnectKey: process.env.NEXT_PUBLIC_WALLETCONNECT_KEY ?? '',
  web3AuthNetwork: process.env.NEXT_PUBLIC_WEB3AUTH_NETWORK ?? '',
  chain: process.env.NEXT_PUBLIC_CHAIN ?? '',
  chainTier: process.env.NEXT_PUBLIC_CHAIN_TIER ?? '',
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
  indexerUrl: process.env.NEXT_PUBLIC_INDEXER_URL ?? '',
  osmosisTestnetApiUrl: process.env.NEXT_PUBLIC_OSMOSIS_TESTNET_API_URL ?? '',
  osmosisTestnetRpcUrl: process.env.NEXT_PUBLIC_OSMOSIS_TESTNET_RPC_URL ?? '',
};

export default env;
