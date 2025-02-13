/**
 * A collection of functions to format data, returning react nodes.
 * This file is intended as a TSX addendum to `./format.ts`.
 */
import { ReactNode } from 'react';
import { DenomVerifiedBadge } from '@/components';
import { formatDenom } from '@/utils/format';

/**
 * Format a denom to a display name react node with a verified badge.
 * @param denom The denom to format.
 * @param small Whether to use a smaller badge.
 */
export function formatDenomWithBadge(denom: string, small?: boolean): ReactNode {
  const cleanDenom = formatDenom(denom);
  const classes = `${small ? 'w-3' : 'w-5'} inline relative bottom-1 text-primary`;

  return (
    <>
      {cleanDenom} <DenomVerifiedBadge base={denom} className={classes} />
    </>
  );
}
