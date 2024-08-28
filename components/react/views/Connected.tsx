/* eslint-disable @next/next/no-img-element */
import { Dialog } from "@headlessui/react";
import {
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { ChevronLeftIcon, CheckIcon } from "@heroicons/react/20/solid";
import copyToClipboard from "copy-to-clipboard";
import { useState } from "react";
import ProfileAvatar from "@/utils/identicon";
import { useBalance } from "@/hooks/useQueries";
import { shiftDigits } from "@/utils";

export function truncate(address: string) {
  return `${address.substring(0, 12)}...${address.substring(
    address.length - 8,
    address.length,
  )}`;
}

export const Address = ({ children: address }: { children: string }) => {
  const [copied, setCopied] = useState<boolean>(false);
  return (
    <button
      className="inline-flex items-center justify-center px-6 py-1 mx-4 mb-4 space-x-2 text-sm  shadow-inner active:shadow-clicked border rounded-full border-black/10 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-white/10 hover:border-zinc-200 dark:hover:border-white/10"
      onClick={() => {
        copyToClipboard(address);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 1500);
      }}
    >
      <div className="flex flex-row w-full justify-between items-center active:scale-95">
        <p>{truncate(address || "")}</p>
        {copied ? (
          <CheckIcon className="w-3 h-3  " />
        ) : (
          <ClipboardDocumentIcon className="w-3 h-3  " />
        )}
      </div>
    </button>
  );
};

export const Connected = ({
  onClose,
  onReturn,
  disconnect,
  name,
  logo,
  username,
  address,
}: {
  onClose: () => void;
  onReturn: () => void;
  disconnect: () => void;
  name: string;
  logo: string;
  username?: string;
  address?: string;
}) => {
  const { balance } = useBalance(address ?? "");

  return (
    <div className="mt-3 text-center sm:mt-1.5 sm:text-left  ">
      <div className="flex flex-row items-center justify-between pl-3">
        <button
          type="button"
          className="p-2 text-primary bg-neutral rounded-full hover:bg-gray-200 "
          onClick={onReturn}
        >
          <span className="sr-only">Return</span>
          <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
        </button>
        <Dialog.Title as="h3" className="font-medium leading-6 text-center  ">
          {name}
        </Dialog.Title>
        <button
          type="button"
          className="p-2 text-primary  bg-neutral rounded-full hover:bg-gray-200 "
          onClick={onClose}
        >
          <span className="sr-only">Close</span>
          <XMarkIcon className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
      <div className="flex flex-col justify-center w-full h-full px-2 pt-4 pb-8 mt-4">
        <div className=" mx-auto">
          <ProfileAvatar walletAddress={address ?? ""} size={48} />
        </div>
        <div className="flex flex-row items-center mx-auto space-x-2">
          <p className="mt-3 text-2xl mb-2 ">{username || ""}</p>
        </div>
        <div className="-mb-2 mx-auto justify-center items-center">
          <Address>{address || ""}</Address>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex flex-row items-center space-x-2">
            {balance?.amount && (
              <p className="text-lg font-medium text-gray-400">
                {shiftDigits(balance?.amount ?? "", -6)}
              </p>
            )}
            {!balance?.amount && <div className="loading"></div>}
            <p className="text-sm font-medium text-gray-400">MFX</p>
          </div>
        </div>
        <button
          className="rounded-lg w-[180px] mx-auto inline-flex mt-4 justify-center items-center py-2.5 font-medium text-black bg-primary "
          onClick={() => {
            disconnect();
            onClose();
          }}
        >
          <ArrowRightOnRectangleIcon className="flex-shrink-0 w-5 h-5 mr-2  " />
          Disconnect
        </button>
      </div>
    </div>
  );
};
