import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { shiftDigits } from '@/utils/maths';
import { denomToAsset } from './ibc';
import { DenomDisplay, DenomVerifiedBadge } from '@/components/factory/components/DenomDisplay';
import env from '@/config/env';
import { ReactNode } from 'react';

export function formatLargeNumber(num: number): string {
  if (!Number.isFinite(num)) return 'Invalid number';
  if (num === 0) return '0';

  const quintillion = 1e18;
  const quadrillion = 1e15;
  const trillion = 1e12;
  const billion = 1e9;
  const million = 1e6;

  if (num < million) {
    return num.toString();
  }

  if (num >= quintillion) {
    return `${(num / quintillion).toFixed(2)}QT`;
  } else if (num >= quadrillion) {
    return `${(num / quadrillion).toFixed(2)}Q`;
  } else if (num >= trillion) {
    return `${(num / trillion).toFixed(2)}T`;
  } else if (num >= billion) {
    return `${(num / billion).toFixed(2)}B`;
  } else if (num >= million) {
    return `${(num / million).toFixed(2)}M`;
  }
  return num.toFixed(6);
}

/**
 * Format a denom to a display name react node with a verified badge.
 * @param denom The denom to format.
 * @param small Whether to use a smaller badge.
 */
export function formatDenomWithBadge(denom: string, small?: boolean): ReactNode {
  const cleanDenom = formatDenom(denom);
  const classes = `${small ? 'w-3' : 'w-5'} mx-1 inline relative bottom-1 text-primary`;

  return (
    <>
      {cleanDenom} <DenomVerifiedBadge base={denom} className={classes} />
    </>
  );
}

export function formatDenom(denom: string): string {
  const assetInfo = denomToAsset(env.chain, denom);

  // Fallback to cleaning the denom if no assetInfo
  let cleanDenom = denom.replace(/^factory\/[^/]+\//, '');

  // Skip cleaning for IBC denoms as they should be resolved via assetInfo
  if (cleanDenom.startsWith('ibc/')) {
    cleanDenom = assetInfo?.display.toUpperCase() ?? '';
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
