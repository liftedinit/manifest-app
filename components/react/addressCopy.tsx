import React, { useState, useEffect, useMemo } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { truncateAddress } from '@/utils';
import { useContacts } from '@/hooks';
import { useDelayResetState } from '@/hooks/useDelayResetState';

export const TruncatedAddressWithCopy = ({
  showName = true,
  address = '',
  slice,
  size,
}: {
  showName?: boolean;
  address: string;
  slice: number;
  size?: string;
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

  const iconSize = size === 'small' ? 10 : 16;
  let truncatedAddress = useMemo(() => {
    if (showName && addressToName.has(address)) {
      return (
        <>
          <span className="truncate">
            {addressToName.get(address)} ({truncateAddress(address, slice)}{' '}
          </span>
          {copied ? <FiCheck size={iconSize} /> : <FiCopy size={iconSize} />})
        </>
      );
    } else {
      return (
        <>
          <span className="truncate whitespace-nowrap">{truncateAddress(address, slice)}</span>
          {copied ? <FiCheck size={iconSize} /> : <FiCopy size={iconSize} />}
        </>
      );
    }
  }, [address, addressToName, copied, iconSize, showName, slice]);

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
