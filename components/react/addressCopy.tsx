import React, { useState, useEffect } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { truncateAddress } from '@/utils';

export const TruncatedAddressWithCopy = ({
  address = '',
  slice,
  size,
}: {
  address: string;
  slice: number;
  size?: string;
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (copied) {
      timer = setTimeout(() => setCopied(false), 2000);
    }
    return () => clearTimeout(timer);
  }, [copied]);

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

  const truncatedAddress = truncateAddress(address, slice);
  const iconSize = size === 'small' ? 10 : 16;

  return (
    <span
      className="flex items-center hover:text-primary dark:hover:text-primary space-x-2 text-[#00000099] dark:text-[#FFFFFF99]"
      onClick={handleCopy}
      style={{ cursor: 'pointer' }}
    >
      <span className="truncate ">{truncatedAddress}</span>
      {copied ? <FiCheck size={iconSize} /> : <FiCopy size={iconSize} />}
    </span>
  );
};
