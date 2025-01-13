import React, { useMemo } from 'react';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { formatDenom, objectSyntax, TransactionGroup } from '@/components';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { shiftDigits } from '@/utils';
import env from '@/config/env';
import { useTheme } from '@/contexts';

interface TxInfoModalProps {
  tx: TransactionGroup;

  modalId: string;
}

export default function TxInfoModal({ tx, modalId }: TxInfoModalProps) {
  const { theme } = useTheme();
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
    <dialog aria-label="tx_info_modal" id={modalId} className={`modal z-[999]`}>
      <div
        className="modal-box max-w-4xl mx-auto rounded-[24px] bg-[#F4F4FF] dark:bg-[#1D192D] shadow-lg relative z-[1000]"
        aria-label="tx info"
      >
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#00000099] dark:text-[#FFFFFF99] hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF1A]">
            ✕
          </button>
        </form>
        <h3 className="text-xl font-semibold text-[#161616] dark:text-white mb-6">
          Transaction Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <InfoItem
              label="TRANSACTION HASH"
              explorerUrl={env.explorerUrl}
              value={tx?.tx_hash}
              isAddress={true}
            />
            <InfoItem
              label="BLOCK"
              explorerUrl={env.explorerUrl}
              value={tx?.block_number?.toString()}
            />
            <InfoItem
              label="TIMESTAMP"
              explorerUrl={env.explorerUrl}
              value={formatDate(tx?.formatted_date)}
            />
          </div>
          <div>
            <InfoItem
              label="FROM"
              explorerUrl={env.explorerUrl}
              value={tx?.data?.from_address}
              isAddress={true}
            />
            {tx?.data?.to_address && (
              <InfoItem
                label="TO"
                explorerUrl={env.explorerUrl}
                value={tx?.data?.to_address}
                isAddress={true}
              />
            )}
            {tx?.data?.amount && (
              <div>
                <p className="text-sm font-semibold text-[#00000099] dark:text-[#FFFFFF99] mb-2">
                  AMOUNT
                </p>
                <div className="bg-[#FFFFFF66] dark:bg-[#FFFFFF1A] rounded-[16px] p-4">
                  {tx?.data?.amount.map((amt, index) => (
                    <p key={index} className="text-[#161616] dark:text-white">
                      {Number(shiftDigits(amt.amount, -6)).toLocaleString(undefined, {
                        maximumFractionDigits: 6,
                      })}{' '}
                      {formatDenom(amt.denom)}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {tx?.data?.metadata && (
          <div>
            <h4 className="text-xl font-semibold text-[#161616] dark:text-white mb-6">Metadata</h4>
            {Object.entries(tx?.data?.metadata).map(([key, value], index) => (
              <MetadataItem key={index} label={key} content={value} theme={theme} />
            ))}
          </div>
        )}
        {tx.memo && (
          <div>
            <InfoItem label="MEMO" explorerUrl={env.explorerUrl} value={tx.memo} />
          </div>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

function MetadataItem({
  label,
  content,
  theme,
}: Readonly<{
  label: string;
  content: string;
  theme: string;
}>) {
  function isJsonString(str: string): boolean {
    try {
      const parsed = JSON.parse(str);
      return parsed !== null && (typeof parsed === 'object' || Array.isArray(parsed));
    } catch (e) {
      return false;
    }
  }

  const isJson = useMemo(() => isJsonString(content), [content]);

  return (
    <div className="mb-6">
      <p className="text-sm font-semibold text-[#00000099] dark:text-[#FFFFFF99] mb-2">
        {label.toUpperCase().replace(/_/g, ' ')}
      </p>
      {isJson ? (
        objectSyntax(JSON.parse(content), theme)
      ) : (
        <div className="bg-[#FFFFFF66] dark:bg-[#FFFFFF1A] rounded-[16px] p-4">
          <p className="text-[#161616] dark:text-white">{content}</p>
        </div>
      )}
    </div>
  );
}

function InfoItem({
  label,
  value,
  explorerUrl,
  isAddress = false,
}: Readonly<{
  label: string;
  value: string;
  explorerUrl: string;
  isAddress?: boolean;
}>) {
  return (
    <div className="mb-4">
      <p className="text-sm font-semibold text-[#00000099] dark:text-[#FFFFFF99] mb-2">{label}</p>
      <div className="bg-[#FFFFFF66] dark:bg-[#FFFFFF1A] rounded-[16px] p-4">
        {isAddress ? (
          <div className="flex items-center">
            <TruncatedAddressWithCopy address={value} slice={24} />
            <a
              href={`${env.explorerUrl}/${label === 'TRANSACTION HASH' ? 'transaction' : 'account'}/${label?.includes('TRANSACTION') ? value?.toUpperCase() : value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-primary hover:text-primary/50"
            >
              <FaExternalLinkAlt />
            </a>
          </div>
        ) : (
          <p className="text-[#161616] dark:text-white">
            {label.includes('TRANSACTION') ? value.toUpperCase() : value}
          </p>
        )}
      </div>
    </div>
  );
}
