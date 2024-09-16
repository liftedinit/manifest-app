import React from 'react';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { formatDenom, TransactionGroup } from '@/components';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { shiftDigits } from '@/utils';

interface TxInfoModalProps {
  tx: TransactionGroup;
  isOpen: boolean;
  onClose: () => void;
}

export default function TxInfoModal({ tx, isOpen, onClose }: TxInfoModalProps) {
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  return (
    <dialog
      aria-label="tx_info_modal"
      id={`tx_modal_${tx.tx_hash}`}
      className={`modal ${isOpen ? 'modal-open' : ''}`}
    >
      <div
        className="modal-box absolute max-w-4xl mx-auto rounded-lg md:ml-20 shadow-lg"
        aria-label="tx info"
      >
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-1 top-1"
            onClick={onClose}
          >
            ✕
          </button>
        </form>
        <h3 className="text-lg font-semibold">Transaction Details</h3>
        <div className="divider divider-horizon -mt-0 mb-0"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 -mt-4">
          <div className="">
            <div className="">
              <p className="text-md font-bold  mt-4">TRANSACTION HASH</p>
              <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                <div className="flex items-center">
                  <TruncatedAddressWithCopy address={tx.tx_hash} slice={8} />
                  <a
                    href={`https://manifest-explorer.vercel.app/manifest/tx/${tx.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-primary hover:text-primary/50"
                  >
                    <FaExternalLinkAlt />
                  </a>
                </div>
              </div>
            </div>
            <div>
              <p className="text-md font-bold  mt-4">BLOCK</p>
              <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                <p className="text-md">{tx.block_number}</p>
              </div>
            </div>
            <div>
              <p className="text-md font-bold mt-4">TIMESTAMP</p>
              <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                <p className="text-md">{formatDate(tx.formatted_date)}</p>
              </div>
            </div>
          </div>
          <div>
            <div aria-label="from">
              <p className="text-md font-bold mt-4">FROM</p>
              <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                <div className="flex items-center">
                  <TruncatedAddressWithCopy address={tx.data.from_address} slice={6} />
                  <a
                    href={`https://manifest-explorer.vercel.app/manifest/account/${tx.data.from_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-primary hover:text-primary/50"
                  >
                    <FaExternalLinkAlt />
                  </a>
                </div>
              </div>
            </div>
            <div aria-label="to">
              <p className="text-md font-bold mt-4">TO</p>
              <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                <div className="flex items-center">
                  <TruncatedAddressWithCopy address={tx.data.to_address} slice={6} />
                  <a
                    href={`https://manifest-explorer.vercel.app/manifest/account/${tx.data.to_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-primary hover:text-primary/50"
                  >
                    <FaExternalLinkAlt />
                  </a>
                </div>
              </div>
            </div>
            <div>
              <p className="text-md font-bold mt-4">VALUE</p>
              <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                {tx.data.amount.map((amt, index) => (
                  <p key={index} className="text-md">
                    {shiftDigits(amt.amount, -6)} {formatDenom(amt.denom)}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
