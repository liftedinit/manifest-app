import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';

import { ExtendedMetadataSDKType } from './types';

export const MFX_TOKEN_DATA: MetadataSDKType = {
  description: 'The native token of the Manifest Chain',
  denom_units: [
    { denom: 'umfx', exponent: 0, aliases: [] },
    { denom: 'mfx', exponent: 6, aliases: [] },
  ],
  base: 'umfx',
  display: 'mfx',
  name: 'Manifest',
  symbol: 'MFX',
  uri: '',
  uri_hash: '',
};

export const OSMOSIS_TOKEN_DATA: MetadataSDKType = {
  description: 'The native token of the Osmosis Chain',
  denom_units: [
    { denom: 'uosmo', exponent: 0, aliases: [] },
    { denom: 'osmo', exponent: 6, aliases: [] },
  ],
  base: 'uosmo',
  display: 'osmo',
  name: 'Osmosis',
  symbol: 'OSMO',
  uri: '',
  uri_hash: '',
};

export const tokenExponents = [
  { exponent: 18, subdenom: 'atto', letter: 'a', description: 'Smallest unit, 10⁻¹⁸' },
  { exponent: 15, subdenom: 'femto', letter: 'f', description: '10⁻¹⁵' },
  { exponent: 12, subdenom: 'pico', letter: 'p', description: '10⁻¹²' },
  { exponent: 9, subdenom: 'nano', letter: 'n', description: '10⁻⁹' },
  { exponent: 6, subdenom: 'micro', letter: 'u', description: '10⁻⁶' },
  { exponent: 3, subdenom: 'milli', letter: 'm', description: '10⁻³' },
];
