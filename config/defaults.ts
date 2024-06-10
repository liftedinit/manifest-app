import * as env from 'env-var';
import {assetNative, assetPoa} from "@/config/assets";

//// CHANGE THE DEFAULTS TO MATCH THE CONFIGURATION OF YOUR PROJECT
////
const DEFAULT_CHAIN_NAME = 'manifest'
const DEFAULT_CHAIN_STATUS = 'live'
const DEFAULT_CHAIN_NETWORK_TYPE = 'testnet'
const DEFAULT_CHAIN_WEBSITE = 'https://liftedinit.org'
const DEFAULT_CHAIN_PRETTY_NAME = 'Manifest Testnet'
const DEFAULT_CHAIN_ID = 'manifest-1'
const DEFAULT_BECH32_PREFIX = 'manifest'
const DEFAULT_DAEMON_NAME = 'manifestd'
const DEFAULT_CHAIN_REPOSITORY = 'https://github.com/liftedinit/manifest-ledger'
const DEFAULT_CHAIN_VERSION = 'v0.0.1-alpha.9'
const DEFAULT_CHAIN_VERSION_NAME = 'v1'
const DEFAULT_CHAIN_SLIP44 = 118
const DEFAULT_FIXED_MIN_GAS_PRICE = 0.0001
const DEFAULT_LOW_GAS_PRICE = 0.0001
const DEFAULT_AVERAGE_GAS_PRICE = 0.0002
const DEFAULT_HIGH_GAS_PRICE = 0.0003
const DEFAULT_RPC_URL = 'https://nodes.chandrastation.com/rpc/manifest/' // "addr1,addr2" will be converted to an array
const DEFAULT_REST_URL = 'https://nodes.chandrastation.com/api/manifest/' // "addr1,addr2" will be converted to an array
////


export const chainName = env.get('NEXT_PUBLIC_CHAIN_NAME').default(DEFAULT_CHAIN_NAME).asString()
const chainStatus = env.get('NEXT_PUBLIC_CHAIN_STATUS').default(DEFAULT_CHAIN_STATUS).asString()
const chainNetworkType = env.get('NEXT_PUBLIC_CHAIN_NETWORK_TYPE').default(DEFAULT_CHAIN_NETWORK_TYPE).asString()
const chainWebsite = env.get('NEXT_PUBLIC_CHAIN_WEBSITE').default(DEFAULT_CHAIN_WEBSITE).asUrlString()
const chainPrettyName = env.get('NEXT_PUBLIC_CHAIN_PRETTY_NAME').default(DEFAULT_CHAIN_PRETTY_NAME).asString()
const chainId = env.get('NEXT_PUBLIC_CHAIN_ID').default(DEFAULT_CHAIN_ID).asString()
const chainBech32Prefix = env.get('NEXT_PUBLIC_BECH32_PREFIX').default(DEFAULT_BECH32_PREFIX).asString()
const chainDaemonName = env.get('NEXT_PUBLIC_DAEMON_NAME').default(DEFAULT_DAEMON_NAME).asString()
const chainRepository = env.get('NEXT_PUBLIC_CHAIN_REPOSITORY').default(DEFAULT_CHAIN_REPOSITORY).asUrlString()
const chainVersion = env.get('NEXT_PUBLIC_CHAIN_VERSION').default(DEFAULT_CHAIN_VERSION).asString()
const chainRecommendedVersion = env.get('NEXT_PUBLIC_CHAIN_RECOMMENDED_VERSION').default(chainVersion).asString()
const chainCompatibleVersions = env.get('NEXT_PUBLIC_CHAIN_COMPATIBLE_VERSIONS').default(chainVersion).asArray()
const chainSlip44 = env.get('NEXT_PUBLIC_CHAIN_SLIP44').default(DEFAULT_CHAIN_SLIP44).asIntPositive()
const chainFixedMinGasPrice = env.get('NEXT_PUBLIC_FIXED_MIN_GAS_PRICE').default(DEFAULT_FIXED_MIN_GAS_PRICE).asFloatPositive()
const chainLowGasPrice = env.get('NEXT_PUBLIC_LOW_GAS_PRICE').default(DEFAULT_LOW_GAS_PRICE).asFloatPositive()
const chainAverageGasPrice = env.get('NEXT_PUBLIC_AVERAGE_GAS_PRICE').default(DEFAULT_AVERAGE_GAS_PRICE).asFloatPositive()
const chainHighGasPrice = env.get('NEXT_PUBLIC_HIGH_GAS_PRICE').default(DEFAULT_HIGH_GAS_PRICE).asFloatPositive()
const chainVersionWithoutV = chainVersion.replace(/^v/, '')
const chainReleasePrefix = `${chainRepository}/releases/download/${chainVersion}/manifest-ledger_${chainVersionWithoutV}`
const chainBinaries = env.get('NEXT_PUBLIC_CHAIN_BINARIES').default({
  "linux/amd64": `${chainReleasePrefix}_linux_amd64.tar.gz`,
  "linux/arm64": `${chainReleasePrefix}_linux_arm64.tar.gz`,
  "darwin/amd64": `${chainReleasePrefix}_darwin_amd64.tar.gz`,
  "darwin/arm64": `${chainReleasePrefix}_darwin_arm64.tar.gz`,
  "windows/amd64": `${chainReleasePrefix}_windows_amd64.tar.gz`,
  "windows/arm64": `${chainReleasePrefix}_windows_arm64.tar.gz`,
}).asJsonObject()
const chainRpcs = env.get('NEXT_PUBLIC_CHAIN_RPCS').default(DEFAULT_RPC_URL).asArray()
const chainRests = env.get('NEXT_PUBLIC_CHAIN_RESTS').default(DEFAULT_REST_URL).asArray()
const chainFees = {fee_tokens: [
    {
      denom: assetNative.base,
      fixed_min_gas_price: chainFixedMinGasPrice,
      low_gas_price: chainLowGasPrice,
      average_gas_price: chainAverageGasPrice,
      high_gas_price: chainHighGasPrice,
    },
  ]}
const chainStakingTokens = {staking_tokens: [{ denom: assetPoa.base }]}
const chainVersions = [
  {
    name: DEFAULT_CHAIN_VERSION_NAME,
    recommended_version: chainRecommendedVersion,
    compatible_versions: chainCompatibleVersions,
  },
]
const chainGenesisUrl = env.get('NEXT_PUBLIC_CHAIN_GENESIS_URL').default(`${chainRepository}/blob/main/network/${chainId}/${chainId}_genesis.json`).asUrlString();
const chainCodebase = {
  git_repo: chainRepository,
  recommended_version: chainRecommendedVersion,
  compatible_versions: chainCompatibleVersions,
  binaries: chainBinaries,
  versions: chainVersions,
  genesis: { genesis_url: chainGenesisUrl },
}
const chainAssets = [assetNative, assetPoa]
const chainApis = {rpc: chainRpcs.map(v => ({address: v})) , rest: chainRests.map(v => ({address: v}))}

export const chainEndpoints = { rpc: chainRpcs, rest: chainRests }
export const defaultChain = {
  chain_name: chainName,
  status: chainStatus,
  network_type: chainNetworkType,
  website: chainWebsite,
  pretty_name: chainPrettyName,
  chain_id: chainId,
  bech32_prefix: chainBech32Prefix,
  daemon_name: chainDaemonName,
  slip44: chainSlip44,
  apis: chainApis,
  fees: chainFees,
  staking: chainStakingTokens,
  codebase: chainCodebase,
}
export const defaultAssets = {
  chain_name: chainName,
  assets: chainAssets,
}
