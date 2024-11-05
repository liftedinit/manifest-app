import React from 'react';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { MetadataSDKType } from '@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { useRouter } from 'next/router';

export const DenomInfoModal: React.FC<{
  denom: MetadataSDKType | null;
  modalId: string;
  isOpen?: boolean;
  onClose?: () => void;
}> = ({ denom, modalId, isOpen, onClose }) => {
  return (
    <dialog id={modalId} className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box max-w-4xl mx-auto rounded-[24px] bg-[#F4F4FF] dark:bg-[#1D192D] shadow-lg">
        <form method="dialog" onSubmit={onClose}>
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 className="text-xl font-semibold text-[#161616] dark:text-white mb-6">Denom Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <InfoItem label="NAME" value={denom?.name ?? 'No name available'} />
            <InfoItem label="SYMBOL" value={denom?.symbol ?? 'No symbol available'} />
            {denom?.description && (
              <InfoItem
                label="DESCRIPTION"
                value={denom?.description ?? 'No description available'}
              />
            )}
            {denom?.denom_units[1]?.exponent && (
              <InfoItem
                label="EXPONENT"
                value={denom?.denom_units[1]?.exponent?.toString() ?? '0'}
              />
            )}
          </div>
          <div>
            {denom?.denom_units?.map((unit: any, index: number) => (
              <div key={index} className="mb-4">
                <InfoItem label="DENOM" value={unit?.denom} />
                <InfoItem label="ALIASES" value={unit?.aliases?.join(', ') || 'No aliases'} />
              </div>
            ))}
          </div>
        </div>
        <h4 className="text-lg font-semibold text-[#161616] dark:text-white mt-6  mb-4">
          Additional Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem
            label="BASE"
            value={denom?.base ? decodeURIComponent(denom.base) : ''}
            isAddress={true}
          />
          <InfoItem label="DISPLAY" value={denom?.display ?? 'No display available'} />
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
}: {
  label: string;
  value: string;
  isAddress?: boolean;
}) {
  return (
    <div className="mb-4 flex flex-col">
      <p className="text-sm font-semibold text-[#00000099] dark:text-[#FFFFFF99] mb-2">{label}</p>
      <div className="bg-base-300 rounded-[16px] p-4 flex-grow">
        {isAddress ? (
          <div className="flex items-center">
            <TruncatedAddressWithCopy address={value} slice={8} />
            <a
              href={`https://testnet.manifest.explorers.guru/account/${value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-primary hover:text-primary/50"
            >
              <FaExternalLinkAlt />
            </a>
          </div>
        ) : (
          <p className="text-[#161616] dark:text-white truncate" title={value}>
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
