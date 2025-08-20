import { MetadataSDKType } from '@manifest-network/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';

import env from '@/config/env';
import { shiftDigits } from '@/utils/maths';

import { denomToAsset } from './ibc';

/**
 * Format configuration for large numbers
 * [threshold value, suffix string, maximum fraction digits]
 * Ordered from largest to smallest threshold
 */
const SUFFIXES: [number, string, number][] = [
  [1e24, '_', 0], // Special case. No suffix for >= 1e24, just scientific notation.
  [1e18, 'QT', 2],
  [1e15, 'Q', 2],
  [1e12, 'T', 2],
  [1e9, 'B', 2],
  [1e6, 'M', 2],
  [0, '', 6],
  // Cannot be negative.
];

/**
 * Format a large number to a human-readable string.
 * @param num The number to format.
 */
export function formatLargeNumber(num: number): string {
  if (!Number.isFinite(num)) return 'Invalid number';
  if (num <= 0) return '0';

  if (num >= SUFFIXES[0][0]) {
    return `${num.toExponential(6).replace(/\.?0*e\+?/, 'e')}`;
  }

  for (const [value, suffix, maximumFractionDigits] of SUFFIXES) {
    if (num >= value) {
      let s = (suffix ? num / value : num).toLocaleString(undefined, {
        maximumFractionDigits,
      });

      return `${s}${suffix}`;
    }
  }

  return num.toLocaleString();
}

export function formatDenom(denom: string): string {
  const assetInfo = denomToAsset(env.chain, denom);

  // Fallback to cleaning the denom if no assetInfo
  let cleanDenom = denom.replace(/^factory\/[^/]+\//, '');

  // Skip cleaning for IBC denoms as they should be resolved via assetInfo
  if (cleanDenom.startsWith('ibc/')) {
    cleanDenom = assetInfo?.display.toUpperCase() ?? cleanDenom;
  } else if (cleanDenom.startsWith('u')) {
    cleanDenom = cleanDenom.slice(1).toUpperCase();
  }

  return cleanDenom;
}

export function formatAmount(amount: string, denom: string, metadata?: MetadataSDKType[]) {
  const meta = metadata?.find(m => m.base === denom);
  const exponent = Number(meta?.denom_units[1]?.exponent) || 6;
  return Number(shiftDigits(amount, -exponent));
}
