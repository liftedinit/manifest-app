import React from 'react';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';

export const DenomInfoModal: React.FC<{
  denom: MetadataSDKType | null;
  modalId: string;
  isOpen?: boolean;
  onClose?: () => void;
}> = ({ denom, modalId, isOpen, onClose }) => {
  return (
    <dialog
      id={modalId}
      className={`modal ${isOpen ? 'modal-open' : ''}`}
      aria-labelledby="denom-info-title"
      aria-modal="true"
    >
      <div className="modal-box max-w-4xl mx-auto rounded-[24px] bg-[#F4F4FF] dark:bg-[#1D192D] shadow-lg">
        <form method="dialog" onSubmit={onClose}>
          <button
            aria-label="Close modal"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          >
            ✕
          </button>
        </form>
        <h3 className="text-xl font-semibold text-[#161616] dark:text-white mb-6">Denom Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem label="Name" value={denom?.name ?? 'No name available'} />
          <InfoItem label="Ticker" value={denom?.display.toUpperCase() ?? 'No ticker available'} />
          <InfoItem
            label="Description"
            value={denom?.description ?? 'No description available'}
            className="col-span-2 row-span-2"
          />
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onSubmit={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
};

function InfoItem({
  label,
  value,
  isAddress = false,
  className = '',
}: {
  label: string;
  value: string;
  isAddress?: boolean;
  className?: string;
}) {
  return (
    <div className={`mb-4 flex flex-col ${className}`}>
      <p className="text-sm font-semibold text-[#00000099] dark:text-[#FFFFFF99] mb-2">{label}</p>
      <div className="bg-base-300 rounded-[16px] p-4 flex-grow h-full">
        {isAddress ? (
          <div className="flex items-center">
            <TruncatedAddressWithCopy address={value} slice={8} />
            <a
              href={`${process.env.NEXT_PUBLIC_TESTNET_EXPLORER_URL}/account/${value}`}
              target="_blank"
              aria-label={`View ${value} on block explorer (opens in new tab)`}
              rel="noopener noreferrer"
              className="ml-2 text-primary hover:text-primary/50"
            >
              <FaExternalLinkAlt aria-hidden="true" />
              <span className="sr-only">External link</span>
            </a>
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
