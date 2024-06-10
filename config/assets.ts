import * as env from "env-var";

//// CHANGE THE DEFAULTS TO MATCH THE CONFIGURATION OF YOUR PROJECT
////
const DEFAULT_ASSET_NATIVE_DESCRIPTION = 'Manifest native token'
const DEFAULT_ASSET_NATIVE_DENOM_BASE = 'umfx'
const DEFAULT_ASSET_NATIVE_DENOM_BASE_EXPONENT = 0
const DEFAULT_ASSET_NATIVE_DENOM_DISPLAY = 'mfx'
const DEFAULT_ASSET_NATIVE_DENOM_DISPLAY_EXPONENT = 6
const DEFAULT_ASSET_NATIVE_DENOM_NAME = 'Manifest Token'
const DEFAULT_ASSET_NATIVE_DENOM_SYMBOL = 'MFX'

const DEFAULT_ASSET_POA_DESCRIPTION = 'Proof of Authority native token'
const DEFAULT_ASSET_POA_DENOM_BASE = 'upoa'
const DEFAULT_ASSET_POA_DENOM_BASE_EXPONENT = 0
const DEFAULT_ASSET_POA_DENOM_DISPLAY = 'poa'
const DEFAULT_ASSET_POA_DENOM_DISPLAY_EXPONENT = 6
const DEFAULT_ASSET_POA_DENOM_NAME = 'Proof of Authority Token'
const DEFAULT_ASSET_POA_DENOM_SYMBOL = 'POA'
////


const ASSET_NATIVE_DENOM_UNITS = [
  {
    denom: DEFAULT_ASSET_NATIVE_DENOM_BASE,
    exponent: DEFAULT_ASSET_NATIVE_DENOM_BASE_EXPONENT,
  },
  {
    denom: DEFAULT_ASSET_NATIVE_DENOM_DISPLAY,
    exponent: DEFAULT_ASSET_NATIVE_DENOM_DISPLAY_EXPONENT,
  },
]

const assetNativeDescription = env.get('NEXT_PUBLIC_ASSET_NATIVE_DESCRIPTION').default(DEFAULT_ASSET_NATIVE_DESCRIPTION).asString()
const assetNativeDenomUnits = env.get('NEXT_PUBLIC_ASSET_NATIVE_DENOM_UNITS').default(ASSET_NATIVE_DENOM_UNITS).asJsonArray()
const assetNativeBase = env.get('NEXT_PUBLIC_ASSET_NATIVE_BASE').default(DEFAULT_ASSET_NATIVE_DENOM_BASE).asString()
const assetNativeName = env.get('NEXT_PUBLIC_ASSET_NATIVE_NAME').default(DEFAULT_ASSET_NATIVE_DENOM_NAME).asString()
const assetNativeDisplay = env.get('NEXT_PUBLIC_ASSET_NATIVE_DISPLAY').default(DEFAULT_ASSET_NATIVE_DENOM_DISPLAY).asString()
const assetNativeSymbol = env.get('NEXT_PUBLIC_ASSET_NATIVE_SYMBOL').default(DEFAULT_ASSET_NATIVE_DENOM_SYMBOL).asString()
export const assetNative = {
  description: assetNativeDescription,
  denom_units: assetNativeDenomUnits,
  base: assetNativeBase,
  name: assetNativeName,
  display: assetNativeDisplay,
  symbol: assetNativeSymbol,
}

const ASSET_POA_DENOM_UNITS = [
  {
    denom: DEFAULT_ASSET_POA_DENOM_BASE,
    exponent: DEFAULT_ASSET_POA_DENOM_BASE_EXPONENT,
  },
  {
    denom: DEFAULT_ASSET_POA_DENOM_DISPLAY,
    exponent: DEFAULT_ASSET_POA_DENOM_DISPLAY_EXPONENT,
  },
]

const assetPoaDescription = env.get('NEXT_PUBLIC_ASSET_POA_DESCRIPTION').default(DEFAULT_ASSET_POA_DESCRIPTION).asString()
const assetPoaDenomUnits = env.get('NEXT_PUBLIC_ASSET_POA_DENOM_UNITS').default(ASSET_POA_DENOM_UNITS).asJsonArray()
const assetPoaBase = env.get('NEXT_PUBLIC_ASSET_POA_BASE').default(DEFAULT_ASSET_POA_DENOM_BASE).asString()
const assetPoaName = env.get('NEXT_PUBLIC_ASSET_POA_NAME').default(DEFAULT_ASSET_POA_DENOM_NAME).asString()
const assetPoaDisplay = env.get('NEXT_PUBLIC_ASSET_POA_DISPLAY').default(DEFAULT_ASSET_POA_DENOM_DISPLAY).asString()
const assetPoaSymbol = env.get('NEXT_PUBLIC_ASSET_POA_SYMBOL').default(DEFAULT_ASSET_POA_DENOM_SYMBOL).asString()
export const assetPoa = {
  description: assetPoaDescription,
  denom_units: assetPoaDenomUnits,
  base: assetPoaBase,
  name: assetPoaName,
  display: assetPoaDisplay,
  symbol: assetPoaSymbol,
}
