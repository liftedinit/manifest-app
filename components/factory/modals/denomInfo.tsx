import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import React from 'react';

import { DenomImage, ModalDialog } from '@/components';
import { DenomDisplay } from '@/components/factory';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import env from '@/config/env';

export interface DenomInfoModalProps {
  open: boolean;
  onClose?: () => void;
  denom: MetadataSDKType | null;
}

export const DenomInfoModal: React.FC<DenomInfoModalProps> = ({ open, onClose, denom }) => {
  let nameIsAddress = denom?.name?.startsWith('factory/manifest1') ?? false;

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Denom Details"
      panelClassName="max-w-4xl"
      icon={<DenomImage withBackground={false} denom={denom} />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoItem
          label="Name"
          value={denom?.name ?? 'No name available'}
          explorerUrl={env.explorerUrl}
          isAddress={nameIsAddress}
        />
        <InfoItem
          label="Ticker"
          value={denom?.display?.toUpperCase() ?? 'No ticker available'}
          explorerUrl={env.explorerUrl}
        />
        <InfoItem
          label="Description"
          value={denom?.description ?? 'No description available'}
          explorerUrl={env.explorerUrl}
          className="col-span-2 row-span-2"
        />
      </div>
      <h4 className="text-lg font-semibold text-[#161616] dark:text-white mt-6  mb-4">
        Additional Information
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoItem
          label="BASE"
          value={
            denom?.base
              ? (() => {
                  try {
                    return decodeURIComponent(denom?.base);
                  } catch (e) {
                    console.error('Failed to decode BASE value:', e);
                    return denom.base;
                  }
                })()
              : ''
          }
          explorerUrl={env.explorerUrl}
          isAddress={true}
        />
        <InfoItem
          label="DISPLAY"
          value={denom?.display ?? 'No display available'}
          explorerUrl={env.explorerUrl}
        />
      </div>
    </ModalDialog>
  );
};

function InfoItem({
  label,
  value,
  explorerUrl,
  isAddress = false,
  className = '',
}: {
  label: string;
  value: string;
  explorerUrl: string;
  isAddress?: boolean;
  className?: string;
}) {
  return (
    <div className={`mb-4 flex flex-col ${className}`}>
      <p className="text-sm font-semibold text-[#00000099] dark:text-[#FFFFFF99] mb-2">{label}</p>
      <div className="dark:bg-[#FFFFFF0F] bg-[#0000000A] rounded-[16px] p-4 grow h-full">
        {isAddress ? (
          <div className="flex items-center">
            <TruncatedAddressWithCopy address={value} slice={17} />
          </div>
        ) : (
          <p className="text-[#161616] dark:text-white" title={value}>
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
