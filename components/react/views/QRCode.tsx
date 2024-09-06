/* eslint-disable @next/next/no-img-element */

import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon } from '@heroicons/react/20/solid';
import { QRCodeSVG } from 'qrcode.react';

export const QRCode = ({
  onClose,
  onReturn,
  qrUri,
  name,
}: {
  onClose: () => void;
  onReturn: () => void;
  qrUri?: string;
  name?: string;
}) => {
  return (
    <div className="mt-3 text-center sm:mt-1.5 sm:text-left">
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
      <div className="w-full mb-4">
        <div className="mt-4">
          <QRCodeSVG
            value={qrUri || ''}
            bgColor={'#ffffff'}
            fgColor={'#000000'}
            level={'L'}
            includeMargin={false}
            className="w-auto p-4 mx-auto border rounded-lg h-64 border-black/10 dark:border-white/10"
          />
        </div>
      </div>
    </div>
  );
};
