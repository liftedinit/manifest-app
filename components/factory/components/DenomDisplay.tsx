import { DenomImage, VerifiedIcon } from '@/components';
import { formatTokenDisplay } from '@/utils';
import React from 'react';

export const DenomVerifiedBadge = ({
  base,
  ...props
}: { base?: string } & { [i: string]: unknown }) => {
  const verified = base === 'umfx';

  return verified ? <VerifiedIcon {...props} /> : <></>;
};

export const DenomDisplay = ({
  denom,
  metadata,
  withBackground,
}: {
  metadata?: {
    display?: string;
    base?: string;
  } | null;
  denom?: string;
  withBackground?: boolean;
}) => {
  const name = formatTokenDisplay(denom ?? metadata?.display ?? '?').toUpperCase();

  return (
    <>
      <div className="flex items-center justify-center">
        <DenomImage withBackground={withBackground} denom={metadata} />
      </div>
      <p className="align-middle font-semibold text-[#161616] dark:text-white">
        {name}
        <DenomVerifiedBadge
          base={metadata?.base}
          className="w-4 mx-1 inline relative bottom-1 text-primary"
        />
      </p>
    </>
  );
};
