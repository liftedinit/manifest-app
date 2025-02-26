import { CheckIcon } from '@heroicons/react/24/outline';
import React, { useMemo } from 'react';
import { FiCheck, FiCopy } from 'react-icons/fi';

import { CopyIcon } from '@/components';
import { useContacts } from '@/hooks';
import { useDelayResetState } from '@/hooks/useDelayResetState';
import { truncateAddress } from '@/utils';

export interface AddressCopyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  address: string;
  onCopy?: () => void;
}

export const AddressCopyButton: React.FC<AddressCopyButtonProps> = ({
  address,
  onCopy,
  ...props
}) => {
  const [copied, setCopied] = useDelayResetState(false, 2000);

  const handleCopy = async (e: React.SyntheticEvent<any>) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      onCopy?.();
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <button onClick={handleCopy} {...props}>
      {copied ? (
        <CheckIcon data-icon="check" height={16} />
      ) : (
        <CopyIcon data-icon="copy" height={16} />
      )}
    </button>
  );
};

/**
 * Show a truncated address with a copy button, and optionally show the name of the address
 * if it exists in the contacts list.
 * @param showName Show the name of the address if it exists in the contacts list. Default to true.
 * @param address The address to show.
 * @param slice The number of characters to show in the address.
 * @param size The size of the icon. Default to 16.
 * @constructor
 */
export const TruncatedAddressWithCopy = ({
  showName = true,
  address,
  slice = 24,
}: {
  showName?: boolean;
  address: string;
  slice?: number;
}) => {
  const { contacts } = useContacts();
  const [copied, setCopied] = useDelayResetState(false, 2000);

  const addressToName = useMemo(() => {
    return contacts.reduce((acc, contact) => {
      acc.set(contact.address, contact.name);
      return acc;
    }, new Map<string, string>());
  }, [contacts]);

  const handleCopy = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  let truncatedAddress = useMemo(() => {
    if (showName && addressToName.has(address)) {
      return (
        <>
          <span className="truncate">
            {addressToName.get(address)} ({truncateAddress(address, slice)}{' '}
          </span>
          {copied ? <FiCheck data-icon="check" size={16} /> : <FiCopy data-icon="copy" size={16} />}
        </>
      );
    } else {
      return (
        <>
          <span className="truncate">{truncateAddress(address, slice)}</span>
          {copied ? <FiCheck data-icon="check" size={16} /> : <FiCopy data-icon="copy" size={16} />}
        </>
      );
    }
  }, [address, addressToName, copied, showName, slice]);

  return (
    <span
      className="flex items-center hover:text-primary dark:hover:text-primary space-x-2 text-[#00000099] dark:text-[#FFFFFF99]"
      onClick={handleCopy}
      style={{ cursor: 'pointer' }}
    >
      {truncatedAddress}
    </span>
  );
};
