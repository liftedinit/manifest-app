import React, { useEffect } from 'react';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import env from '@/config/env';

export const DenomInfoModal: React.FC<{
  openDenomInfoModal: boolean;
  setOpenDenomInfoModal: (open: boolean) => void;
  denom: MetadataSDKType | null;
  modalId: string;
}> = ({ openDenomInfoModal, setOpenDenomInfoModal, denom, modalId }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openDenomInfoModal) {
        setOpenDenomInfoModal(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [openDenomInfoModal]);
  let nameIsAddress = false;
  if (denom?.name?.startsWith('factory/manifest1')) {
    nameIsAddress = true;
  }

  const handleClose = () => {
    setOpenDenomInfoModal(false);
  };

  return (
    <dialog
      id={modalId}
      className={`modal ${openDenomInfoModal ? 'modal-open' : ''}`}
      aria-labelledby="denom-info-title"
      aria-modal="true"
      onClose={handleClose}
    >
      <div className="modal-box max-w-4xl mx-auto rounded-[24px] bg-[#F4F4FF] dark:bg-[#1D192D] shadow-lg">
        <form method="dialog">
          <button
            aria-label="Close modal"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={handleClose}
          >
            ✕
          </button>
        </form>
        <h3 className="text-xl font-semibold text-[#161616] dark:text-white mb-6">Denom Details</h3>
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
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={handleClose}>close</button>
      </form>
    </dialog>
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
      <div className="bg-base-300 rounded-[16px] p-4 flex-grow h-full">
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
