import { Dialog } from '@headlessui/react';
import {
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ClipboardIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { ChevronLeftIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import ProfileAvatar from '@/utils/identicon';
import { useBalance } from '@/hooks/useQueries';
import { shiftDigits, truncateString } from '@/utils';

export const Connected = ({
  onClose,
  onReturn,
  disconnect,
  name,
  username,
  address,
}: {
  onClose: () => void;
  onReturn: () => void;
  disconnect: () => void;
  name: string;
  username?: string;
  address?: string;
}) => {
  const { balance } = useBalance(address ?? '');
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <div className="flex justify-between items-center mb-2">
        <button
          type="button"
          className="p-2 text-primary bg-neutral rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={onReturn}
        >
          <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
        </button>
        <Dialog.Title as="h3" className="text-lg font-semibold">
          {name}
        </Dialog.Title>
        <button
          type="button"
          className="p-2 text-primary bg-neutral rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={onClose}
        >
          <XMarkIcon className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <hr className="border-t border-gray-200 dark:border-gray-700 my-4" />

      <div className="flex items-center mb-6">
        <ProfileAvatar walletAddress={address ?? ''} size={64} />
        <div className="ml-4">
          <p className="text-xl font-semibold">{username || 'Anonymous'}</p>
          <div className="flex items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {truncateString(address || '', 18)}
            </p>
            <button
              onClick={copyAddress}
              className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {copied ? (
                <CheckIcon className="w-4 h-4 text-green-500" />
              ) : (
                <ClipboardIcon className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-base-300 dark:bg-base-300 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Balance</p>
        <div className="flex items-center">
          {balance?.amount ? (
            <p className="text-2xl font-bold">{shiftDigits(balance?.amount ?? '', -6)}</p>
          ) : (
            <div className="loading w-16 h-8"></div>
          )}
          <p className="text-lg ml-2">MFX</p>
        </div>
      </div>

      <button
        className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center"
        onClick={() => {
          disconnect();
          onClose();
        }}
      >
        <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
        Disconnect
      </button>
    </div>
  );
};
