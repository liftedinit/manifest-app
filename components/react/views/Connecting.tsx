/* eslint-disable @next/next/no-img-element */

import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon } from '@heroicons/react/20/solid';
import { getRealLogo } from '@/utils';
import { useTheme } from '@/contexts';

export const Connecting = ({
  onClose,
  onReturn,
  name,
  logo,
  title,
  subtitle,
}: {
  onClose: () => void;
  onReturn: () => void;
  name: string;
  logo: string;
  title: string;
  subtitle: string;
}) => {
  const { theme } = useTheme();
  return (
    <div className="mt-3 text-center sm:mt-1.5">
      <div className="flex justify-between items-center mb-2">
        <button
          type="button"
          className="p-2 text-primary bg-neutral rounded-full hover:bg-gray-200 dark:hover:bg-[#00000033]"
          onClick={onReturn}
        >
          <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
        </button>
        <Dialog.Title as="h3" className="text-lg font-semibold">
          {name}
        </Dialog.Title>
        <button
          type="button"
          className="p-2 text-primary bg-neutral rounded-full hover:bg-gray-200 dark:hover:bg-[#00000033]"
          onClick={onClose}
        >
          <XMarkIcon className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
      <div className="flex flex-col w-full h-full mt-4 sm:px-8 sm:py-6">
        <img
          src={name === 'Cosmos MetaMask Extension' ? '/metamask.svg' : getRealLogo(logo)}
          alt={name}
          className="flex-shrink-0 w-20 h-20 mx-auto aspect-1"
        />
        <p className="mt-3 font-medium ">{title}</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-white/75">{subtitle}</p>
      </div>
    </div>
  );
};
