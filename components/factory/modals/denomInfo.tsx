import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { FaExternalLinkAlt } from 'react-icons/fa';

export function DenomInfoModal({ denom, modalId }: { denom: any; modalId: string }) {
  return (
    <dialog aria-label="denom_info_modal" id={modalId} className="modal">
      <div className="modal-box max-w-4xl mx-auto rounded-[24px] bg-[#F4F4FF] dark:bg-[#1D192D] shadow-lg">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#00000099] dark:text-[#FFFFFF99] hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF1A]">
            ✕
          </button>
        </form>
        <h3 className="text-xl font-semibold text-[#161616] dark:text-white mb-6">Denom Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <InfoItem label="NAME" value={denom.name ?? 'No name available'} />
            <InfoItem label="SYMBOL" value={denom.symbol ?? 'No symbol available'} />
            <InfoItem label="DESCRIPTION" value={denom.description ?? 'No description available'} />
            <InfoItem label="EXPONENT" value={denom?.denom_units[1]?.exponent ?? '0'} />
          </div>
          <div>
            {denom.denom_units.map((unit: any, index: number) => (
              <div key={index} className="mb-4">
                <InfoItem label="DENOM" value={unit.denom} />
                <InfoItem label="ALIASES" value={unit.aliases.join(', ') || 'No aliases'} />
              </div>
            ))}
          </div>
        </div>
        <h4 className="text-lg font-semibold text-[#161616] dark:text-white mt-6  mb-4">
          Additional Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem label="BASE" value={denom.base} isAddress={true} />
          <InfoItem label="DISPLAY" value={denom.display ?? 'No display available'} />
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

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
      <div className="bg-[#FFFFFF66] dark:bg-[#FFFFFF1A] rounded-[16px] p-4 flex-grow">
        {isAddress ? (
          <div className="flex items-center">
            <TruncatedAddressWithCopy address={value} slice={8} />
            <a
              href={`https://manifest-explorer.vercel.app/manifest/account/${value}`}
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
