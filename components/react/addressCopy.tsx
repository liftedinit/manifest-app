import React, { useState, useEffect } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";

export const TruncatedAddressWithCopy = ({
  address,
  slice,
  size,
}: {
  address: string;
  slice: number;
  size?: string;
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (copied) {
      timer = setTimeout(() => setCopied(false), 2000);
    }
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const truncatedAddress = `${address.slice(0, slice)}...${address.slice(-6)}`;
  const iconSize = size === "small" ? 10 : 16;

  return (
    <div
      className="flex items-center space-x-2"
      onClick={handleCopy}
      style={{ cursor: "pointer" }}
    >
      <span className="truncate">{truncatedAddress}</span>
      {copied ? <FiCheck size={iconSize} /> : <FiCopy size={iconSize} />}
    </div>
  );
};

export const AddressWithCopy = ({ address }: { address: string }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (copied) {
      timer = setTimeout(() => setCopied(false), 2000);
    }
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div
      className="flex items-center space-x-2"
      onClick={handleCopy}
      style={{ cursor: "pointer" }}
    >
      <span>{address}</span>
      {copied ? <FiCheck size="16" /> : <FiCopy size="16" />}
    </div>
  );
};
