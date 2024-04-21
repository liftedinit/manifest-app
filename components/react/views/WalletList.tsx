/* eslint-disable @next/next/no-img-element */
import { useChain } from "@cosmos-kit/react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { ChainWalletBase } from "cosmos-kit";

export const WalletList = ({
  onClose,
  onWalletClicked,
  wallets,
}: {
  onClose: () => void;
  onWalletClicked: (name: string) => void;
  wallets: ChainWalletBase[];
}) => {
  return (
    <div className="mt-2 text-center sm:mt-0.5 sm:text-left">
      <div className="flex flex-row items-center justify-between pl-3">
        <Dialog.Title as="h3" className="font-medium leading-6 ">
          Select a Wallet
        </Dialog.Title>
        <button type="button" className="p-2 rounded-full " onClick={onClose}>
          <span className="sr-only">Close</span>
          <XMarkIcon className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
      <div className="flex flex-col w-full mt-2 space-y-2 mb-2 overflow-y-auto h-[300px] ">
        {wallets.map(({ walletInfo: { name, prettyName, logo } }) => (
          <button
            key={name}
            onClick={() => onWalletClicked(name)}
            className="inline-flex items-center justify-between w-full px-2 py-2.5 transition duration-150 ease-in-out border border-base-100 rounded-lg group "
          >
            <div className="flex flex-row items-center space-x-2">
              <img
                src={logo?.toString() ?? ""}
                alt={prettyName}
                className="flex-shrink-0 w-7 h-7 aspect-1"
              />
              <p className="font-medium e group-hover:text-primary">
                {prettyName}
              </p>
            </div>
            <ChevronRightIcon className="flex-shrink-0 w-4 h-4  group-hover:text-primary" />
          </button>
        ))}
      </div>
    </div>
  );
};
