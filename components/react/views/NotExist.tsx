/* eslint-disable @next/next/no-img-element */
import { Dialog } from '@headlessui/react';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon } from '@heroicons/react/20/solid';
import { getRealLogo } from '@/utils';

export const NotExist = ({
  onClose,
  onReturn,
  onInstall,
  logo,
  name,
}: {
  onClose: () => void;
  onReturn: () => void;
  onInstall: () => void;
  logo: string;
  name: string;
}) => {
  return (
    <div className="mt-3 text-center sm:mt-1.5">
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
      <div className="flex flex-col w-full h-full py-6 mt-4 sm:px-8">
        <img
          src={getRealLogo(logo)}
          alt={name}
          className="flex-shrink-0 w-16 h-16 mx-auto aspect-1"
        />
        <p className="mt-3 font-medium text-black dark:text-white">Install {name}</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-white/75">
          To connect your {name} wallet, install the browser extension.
        </p>
        <button
          className="rounded-lg bg-purple-damp hover:bg-purple-damp/75 inline-flex justify-center items-center py-2.5 font-medium mt-4 text-white"
          onClick={onInstall}
        >
          <ArrowDownTrayIcon className="flex-shrink-0 w-5 h-5 mr-2 text-white" />
          Install {name}
        </button>
      </div>
    </div>
  );
};
